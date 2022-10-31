import { IconButton, LinearProgress } from "@mui/material";
import { useRef } from "react";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import { useState } from "react";

export default function NftImage(props) {
  const { imageUrl, videoUrl, mediaType } = props;
  const [paused, setPaused] = useState(true);
  const [percentage, setPercentage] = useState(0);
  const videoElement = useRef(null);

  const togglePlay = () => {
    setPaused(!videoElement.current.paused);
    if (videoElement.current.paused) {
      videoElement.current.play();
    } else {
      videoElement.current.pause();
    }
  };

  const updatePlaytime = (e) => {
    const ratio =
      videoElement.current.currentTime / videoElement.current.duration;

    if (ratio >= 1) {
      setPercentage(0);
      setPaused(true);
    } else {
      setPercentage(ratio * 100);
    }
  };

  if (mediaType) {
    if (mediaType.match(/audio/)) {
      return (
        <>
          <img src={imageUrl} alt="" width="100%" height="100%" />
          <IconButton
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              color: "rgba(255,255,255,0.4)",
              "&:hover": { color: "white" },
            }}
            onClick={togglePlay}
          >
            {paused ? (
              <PlayCircleIcon sx={{ fontSize: 70 }} />
            ) : (
              <PauseCircleIcon sx={{ fontSize: 70 }} />
            )}
          </IconButton>
          <LinearProgress
            value={percentage}
            variant="determinate"
            sx={{
              width: "100%",
              position: "absolute",
              bottom: 0,
              left: 0,
              height: percentage > 0 ? 6 : 0,
              transition: "height 300ms ease",
            }}
          />
          <video
            playsInline
            src={videoUrl}
            style={{
              display: "none",
            }}
            ref={videoElement}
            onTimeUpdate={updatePlaytime}
          ></video>
        </>
      );
    } else if (mediaType.match(/video/)) {
      return (
        <video
          autoPlay
          loop
          muted
          playsInline
          src={videoUrl}
          width="100%"
          height="100%"
        ></video>
      );
    } else {
      return <img src={imageUrl} alt="" width="100%" height="100%" />;
    }
  } else {
    return <img src={imageUrl} alt="" width="100%" height="100%" />;
  }
}
