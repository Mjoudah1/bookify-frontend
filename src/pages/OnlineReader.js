import React from 'react';
import { Container } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';

import useOnlineReader from '../hooks/useOnlineReader';
import { getToken, getUserInfo } from '../utils/auth';
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
  const userInfo = React.useMemo(() => getUserInfo(), []);
  const originalGetDisplayMediaRef = React.useRef(null);
  const [downloading, setDownloading] = React.useState(false);
  const [voices, setVoices] = React.useState([]);
  const [selectedVoice, setSelectedVoice] = React.useState('');
  const [speechRate, setSpeechRate] = React.useState(1);
  const [voiceStatus, setVoiceStatus] = React.useState('');
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [captureBlocked, setCaptureBlocked] = React.useState(false);
  const [captureMessage, setCaptureMessage] = React.useState('');
  const [watermarkSeed, setWatermarkSeed] = React.useState(() =>
    Math.random().toString(36).slice(2, 8).toUpperCase()
  );
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

  React.useEffect(() => {
    let releaseTimer;
    let persistentShield = false;
    let captureLockTriggered = false;

    const showCaptureShield = (message, options = {}) => {
      const { persist = false, duration = 1800 } = options;
      window.clearTimeout(releaseTimer);
      persistentShield = persist;
      setCaptureBlocked(true);
      setCaptureMessage(
        message || 'Reader content is temporarily hidden for protection.'
      );

      if (!persist) {
        releaseTimer = window.setTimeout(() => {
          setCaptureBlocked(false);
          setCaptureMessage('');
        }, duration);
      }
    };

    const hideReaderUntilFocus = (message) => {
      showCaptureShield(message, { persist: true });
    };

    const triggerCaptureLock = (message) => {
      captureLockTriggered = true;
      showCaptureShield(message, { persist: true });
    };

    const releasePersistentShield = () => {
      if (!persistentShield || document.hidden || captureLockTriggered) {
        return;
      }

      persistentShield = false;
      window.clearTimeout(releaseTimer);
      releaseTimer = window.setTimeout(() => {
        setCaptureBlocked(false);
        setCaptureMessage('');
      }, 250);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        hideReaderUntilFocus(
          'Reader content was hidden because the tab lost visibility.'
        );
        return;
      }

      releasePersistentShield();
    };

    const handleWindowBlur = () => {
      hideReaderUntilFocus(
        'Reader content was hidden because the window lost focus.'
      );
    };

    const handleWindowFocus = () => {
      releasePersistentShield();
    };

    const handleKeyDown = async (event) => {
      const key = String(event.key || '').toLowerCase();
      const blockedShortcut =
        key === 'printscreen' ||
        key === 'f12' ||
        ((event.ctrlKey || event.metaKey) &&
          ['p', 's', 'u', 'c'].includes(key)) ||
        ((event.ctrlKey || event.metaKey) &&
          event.shiftKey &&
          ['i', 'j', 'c', 's'].includes(key));

      if (!blockedShortcut) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      if (key === 'printscreen') {
        triggerCaptureLock(
          'The reader was locked because a screenshot attempt was detected. Reload the page to continue reading.'
        );
      } else {
        showCaptureShield(
          'Capture, print, save, and inspection shortcuts are disabled in the online reader.'
        );
      }

      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText('');
        } catch {
          // Clipboard access may be unavailable depending on the browser.
        }
      }
    };

    const preventContextMenu = (event) => {
      event.preventDefault();
    };

    const preventCopy = (event) => {
      event.preventDefault();
      showCaptureShield('Copying and quick capture actions are disabled here.');
    };

    const preventPrint = (event) => {
      if (event?.preventDefault) {
        event.preventDefault();
      }
      showCaptureShield('Printing is disabled while protected reading is active.');
    };

    const preventSelection = (event) => {
      event.preventDefault();
    };

    const blockDisplayCapture = () => {
      triggerCaptureLock(
        'The reader was locked because a screen recording or display capture attempt was detected. Reload the page to continue reading.'
      );
      return Promise.reject(
        new Error('Display capture is disabled in the protected reader.')
      );
    };

    if (
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getDisplayMedia === 'function'
    ) {
      originalGetDisplayMediaRef.current =
        navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices);
      navigator.mediaDevices.getDisplayMedia = blockDisplayCapture;
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('selectstart', preventSelection);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', preventContextMenu);
    window.addEventListener('copy', preventCopy);
    window.addEventListener('cut', preventCopy);
    window.addEventListener('dragstart', preventSelection);
    window.addEventListener('beforeprint', preventPrint);

    return () => {
      window.clearTimeout(releaseTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('selectstart', preventSelection);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', preventContextMenu);
      window.removeEventListener('copy', preventCopy);
      window.removeEventListener('cut', preventCopy);
      window.removeEventListener('dragstart', preventSelection);
      window.removeEventListener('beforeprint', preventPrint);

      if (navigator.mediaDevices && originalGetDisplayMediaRef.current) {
        navigator.mediaDevices.getDisplayMedia =
          originalGetDisplayMediaRef.current;
      }
    };
  }, []);

  React.useEffect(() => {
    const timerId = window.setInterval(() => {
      setWatermarkSeed(Math.random().toString(36).slice(2, 8).toUpperCase());
    }, 4000);

    return () => window.clearInterval(timerId);
  }, []);

  const watermarkText = React.useMemo(() => {
    const identity =
      userInfo?.username ||
      userInfo?.name ||
      userInfo?.email ||
      userInfo?.userId ||
      'Protected Reader';

    return `${identity} | ${book?.title || 'Protected Book'} | ${new Date().toLocaleTimeString()} | ${watermarkSeed}`;
  }, [book?.title, userInfo, watermarkSeed]);

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

        <ReaderFrame
          book={book}
          ebookUrl={ebookUrl}
          captureBlocked={captureBlocked}
          captureMessage={captureMessage}
          watermarkText={watermarkText}
        />
      </Container>
    </div>
  );
}
