import { Box, IconButton, Skeleton } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import NftImage from './nftImage';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NftDialog from '../dialogs/nftDialog';

export default function Nft(props) {
  const { uri, address, tokenId } = props;
  const [name, setName] = useState(null);
  const [description, setDescription] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [mediaType, setMediaType] = useState(null);

  useEffect(() => {
    axios({ url: uri })
      .then((res) => {
        setImageUrl(res.data?.image || '/wunderpool_logo.svg');
        setVideoUrl(res.data?.video_url || res.data?.animation_url);
        setName(res.data?.name);
        setDescription(res.data?.description);
      })
      .catch((err) => {
        console.log(err);
        setImageUrl('/wunderpool_logo.svg');
      })
      .then(() => {
        setLoading(false);
      });
  }, [uri]);

  useEffect(() => {
    if (!videoUrl) return;
    axios({ url: videoUrl }).then((res) => {
      console.log(res.headers['content-type']);
      setMediaType(res.headers['content-type']);
    });
  }, [videoUrl]);

  return (
    <>
      <Box
        width="100%"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        position="relative"
        sx={{
          aspectRatio: '1/1',
          backgroundColor: 'rgba(0,0,0,0.1)',
          borderRadius: 2,
        }}
      >
        {loading ? (
          <Skeleton width="100%" height="100%" />
        ) : (
          <NftImage
            imageUrl={imageUrl}
            videoUrl={videoUrl}
            mediaType={mediaType}
          />
        )}
        <IconButton
          color="default"
          onClick={() => setOpen(true)}
          sx={{ position: 'absolute', right: 0, top: 0 }}
        >
          <MoreVertIcon />
        </IconButton>
      </Box>
      <NftDialog
        open={open}
        setOpen={setOpen}
        name={name}
        description={description}
        address={address}
        tokenId={tokenId}
        imageUrl={imageUrl}
        {...props}
      />
    </>
  );
}
