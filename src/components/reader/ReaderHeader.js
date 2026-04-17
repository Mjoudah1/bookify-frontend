import React from 'react';
import { Button } from 'react-bootstrap';

export default function ReaderHeader({
  title,
  author,
  onBack,
  canDownload,
  onDownload,
  downloading,
  canReadAloud,
  voiceLoading,
  voiceStatus,
  onReadAloud,
  onPauseVoice,
  onResumeVoice,
  onStopVoice,
  isSpeaking,
  isPaused,
  selectedVoice,
  onVoiceChange,
  voices,
  speechRate,
  onRateChange,
}) {
  return (
    <>
      <div className="d-flex flex-wrap gap-2 mb-3">
        <Button
          variant="outline-secondary"
          className="rounded-pill px-3"
          onClick={onBack}
        >
          Back
        </Button>

        {canDownload && (
          <Button
            variant="primary"
            className="rounded-pill px-3"
            onClick={onDownload}
            disabled={downloading}
          >
            {downloading ? 'Preparing download...' : 'Download Book'}
          </Button>
        )}

        <Button
          variant="success"
          className="rounded-pill px-3"
          onClick={onReadAloud}
          disabled={!canReadAloud || voiceLoading || isSpeaking}
        >
          {voiceLoading ? 'Preparing voice...' : 'Read Aloud'}
        </Button>

        <Button
          variant="outline-secondary"
          className="rounded-pill px-3"
          onClick={onPauseVoice}
          disabled={!isSpeaking || isPaused}
        >
          Pause
        </Button>

        <Button
          variant="outline-secondary"
          className="rounded-pill px-3"
          onClick={onResumeVoice}
          disabled={!isPaused}
        >
          Resume
        </Button>

        <Button
          variant="outline-danger"
          className="rounded-pill px-3"
          onClick={onStopVoice}
          disabled={!isSpeaking && !isPaused}
        >
          Stop
        </Button>
      </div>

      <div className="mb-2">
        <h5 className="mb-0">
          {title} - <span className="text-muted">Online Reader</span>
        </h5>
        {author && <small className="text-muted">by {author}</small>}
      </div>

      <div className="reader-voice-toolbar mb-3">
        <div className="reader-voice-controls">
          <select
            className="form-select reader-voice-select"
            value={selectedVoice}
            onChange={(e) => onVoiceChange(e.target.value)}
            disabled={voices.length === 0}
          >
            <option value="">Default voice</option>
            {voices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name} ({voice.lang || 'auto'})
              </option>
            ))}
          </select>

          <div className="reader-voice-rate">
            <span className="reader-voice-rate-label">
              Speed {speechRate.toFixed(1)}x
            </span>
            <input
              type="range"
              min="0.7"
              max="1.4"
              step="0.1"
              value={speechRate}
              onChange={(e) => onRateChange(Number(e.target.value))}
            />
          </div>
        </div>

        {voiceStatus && (
          <div className="reader-voice-status">
            <i className="bi bi-volume-up me-1"></i>
            {voiceStatus}
          </div>
        )}
      </div>
    </>
  );
}
