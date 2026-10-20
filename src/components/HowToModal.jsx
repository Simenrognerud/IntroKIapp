import Modal from "./Modal";
import Icon from "./Icon";

// ---------------------------------------------------------------------------
// "How to do this exercise" popup.
// Right now it shows a placeholder where the video will go, plus a short text
// cue from data/exercises.js.
//
// ADD VIDEOS LATER: set `videoUrl` on the exercise in data/exercises.js
// (an mp4 link). This component will then show it automatically.
// ---------------------------------------------------------------------------
export default function HowToModal({ exercise, onClose }) {
  return (
    <Modal title={exercise.name} onClose={onClose}>
      <span className="chip">{exercise.muscle}</span>

      {exercise.videoUrl ? (
        <video className="howto-video" src={exercise.videoUrl} controls playsInline />
      ) : (
        <div className="howto-video placeholder">
          <Icon name="play" size={32} />
          <span>Video coming soon</span>
        </div>
      )}

      <h4>Quick cue</h4>
      <p className="muted">{exercise.cue}</p>
    </Modal>
  );
}
