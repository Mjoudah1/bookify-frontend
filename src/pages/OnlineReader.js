import React from 'react';
import { Container } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';

import useOnlineReader from '../hooks/useOnlineReader';
import { getToken } from '../utils/auth';
import ReaderLoading from '../components/reader/ReaderLoading';
import ReaderError from '../components/reader/ReaderError';
import ReaderHeader from '../components/reader/ReaderHeader';
import ReaderFrame from '../components/reader/ReaderFrame';

const hasArabicCharacters = (text) => /[\u0600-\u06FF]/.test(text || '');

const getPreferredVoice = (voices, selectedVoice, language) => {
  if (!Array.isArray(voices) || voices.length === 0) {
    return null;
  }

  if (selectedVoice) {
    return voices.find((voice) => voice.voiceURI === selectedVoice) || null;
  }

  const normalizedLanguage = String(language || '').toLowerCase();
  if (normalizedLanguage.startsWith('ar')) {
    return (
      voices.find((voice) =>
        String(voice.lang || '').toLowerCase().startsWith('ar')
      ) || null
    );
  }

  return (
    voices.find((voice) =>
      String(voice.lang || '').toLowerCase().startsWith('en')
    ) || null
  );
};

export default function OnlineReader() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [downloading, setDownloading] = React.useState(false);
  const [voices, setVoices] = React.useState([]);
  const [selectedVoice, setSelectedVoice] = React.useState('');
  const [speechRate, setSpeechRate] = React.useState(1);
  const [voiceStatus, setVoiceStatus] = React.useState('');
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const utterancesRef = React.useRef([]);

  const {
    book,
    ebookUrl,
    canDownload,
    downloadUrl,
    voiceText,
    voiceLoading,
    voiceError,
    loading,
    error,
  } = useOnlineReader(bookId);

  React.useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return undefined;

    const updateVoices = () => {
      const availableVoices = synth.getVoices() || [];
      setVoices(availableVoices);
    };

    updateVoices();
    synth.addEventListener('voiceschanged', updateVoices);

    return () => {
      synth.cancel();
      synth.removeEventListener('voiceschanged', updateVoices);
    };
  }, []);

  const stopVoice = React.useCallback((nextStatus = 'Voice reader stopped.') => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    utterancesRef.current = [];
    setIsSpeaking(false);
    setIsPaused(false);
    setVoiceStatus(nextStatus);
  }, []);

  const buildSpeechChunks = React.useCallback((text) => {
    const normalized = String(text || '').replace(/\s+/g, ' ').trim();
    if (!normalized) return [];

    const chunks = [];
    let remaining = normalized;
    const maxChunkLength = 900;

    while (remaining.length > maxChunkLength) {
      let breakIndex = remaining.lastIndexOf('.', maxChunkLength);
      if (breakIndex < 250) {
        breakIndex = remaining.lastIndexOf(' ', maxChunkLength);
      }
      if (breakIndex < 250) {
        breakIndex = maxChunkLength;
      }

      chunks.push(remaining.slice(0, breakIndex + 1).trim());
      remaining = remaining.slice(breakIndex + 1).trim();
    }

    if (remaining) {
      chunks.push(remaining);
    }

    return chunks.filter(Boolean);
  }, []);

  const handleReadAloud = React.useCallback(() => {
    if (!window.speechSynthesis) {
      setVoiceStatus('Voice reader is not supported in this browser.');
      return;
    }

    if (!voiceText) {
      setVoiceStatus(
        voiceError || 'This book does not have readable text for voice mode.'
      );
      return;
    }

    stopVoice('');

    const speechChunks = buildSpeechChunks(voiceText);
    if (speechChunks.length === 0) {
      setVoiceStatus('No readable text was found for voice reading.');
      return;
    }

    const detectedLanguage = hasArabicCharacters(voiceText) ? 'ar-SA' : 'en-US';
    const selectedVoiceObject = getPreferredVoice(
      voices,
      selectedVoice,
      detectedLanguage
    );

    utterancesRef.current = speechChunks.map((chunk, index) => {
      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.rate = speechRate;
      utterance.lang = detectedLanguage;
      if (selectedVoiceObject) {
        utterance.voice = selectedVoiceObject;
      }

      if (index === 0) {
        utterance.onstart = () => {
          setIsSpeaking(true);
          setIsPaused(false);
          setVoiceStatus(
            detectedLanguage.startsWith('ar')
              ? 'Voice reader is playing in Arabic.'
              : 'Voice reader is playing.'
          );
        };
      }

      utterance.onend = () => {
        if (index === speechChunks.length - 1) {
          setIsSpeaking(false);
          setIsPaused(false);
          setVoiceStatus('Voice reader finished.');
        }
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        setVoiceStatus('Voice reader stopped because of a playback error.');
      };

      return utterance;
    });

    utterancesRef.current.forEach((utterance) => {
      window.speechSynthesis.speak(utterance);
    });
  }, [
    buildSpeechChunks,
    selectedVoice,
    speechRate,
    stopVoice,
    voiceError,
    voiceText,
    voices,
  ]);

  const handlePauseVoice = React.useCallback(() => {
    if (!window.speechSynthesis || !isSpeaking) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setVoiceStatus('Voice reader paused.');
  }, [isSpeaking]);

  const handleResumeVoice = React.useCallback(() => {
    if (!window.speechSynthesis || !isPaused) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
    setIsSpeaking(true);
    setVoiceStatus('Voice reader resumed.');
  }, [isPaused]);

  React.useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleDownload = async () => {
    if (!canDownload || !downloadUrl) return;

    try {
      setDownloading(true);

      const token = getToken();
      if (!token) {
        throw new Error('You must be logged in to download this book.');
      }

      const res = await fetch(downloadUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        let message = 'Failed to download this book.';
        try {
          const errorData = await res.json();
          message = errorData.message || message;
        } catch {
          // Ignore JSON parsing errors and use the fallback message.
        }
        throw new Error(message);
      }

      const blob = await res.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const safeTitle = (book?.title || 'book').replace(/[<>:"/\\|?*]+/g, ' ');
      const extension = book?.ebookFile?.toLowerCase().endsWith('.epub')
        ? 'epub'
        : 'pdf';

      link.href = objectUrl;
      link.download = `${safeTitle.trim() || 'book'}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (downloadError) {
      window.alert(downloadError.message || 'Download failed.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <ReaderLoading />;

  if (error)
    return <ReaderError error={error} onBack={() => navigate(-1)} />;

  if (!book || !ebookUrl)
    return (
      <ReaderError
        error="Could not load this e-book."
        onBack={() => navigate(-1)}
      />
    );

  return (
    <div className="online-reader-page">
      <Container className="pb-4">
        <ReaderHeader
          title={book.title}
          author={book.author}
          onBack={() => navigate(-1)}
          canDownload={canDownload}
          onDownload={handleDownload}
          downloading={downloading}
          canReadAloud={Boolean(voiceText) && !voiceLoading}
          voiceLoading={voiceLoading}
          voiceStatus={voiceError || voiceStatus}
          onReadAloud={handleReadAloud}
          onPauseVoice={handlePauseVoice}
          onResumeVoice={handleResumeVoice}
          onStopVoice={() => stopVoice()}
          isSpeaking={isSpeaking}
          isPaused={isPaused}
          selectedVoice={selectedVoice}
          onVoiceChange={setSelectedVoice}
          voices={voices}
          speechRate={speechRate}
          onRateChange={setSpeechRate}
        />

        <ReaderFrame book={book} ebookUrl={ebookUrl} />
      </Container>
    </div>
  );
}
