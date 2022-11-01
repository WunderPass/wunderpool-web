import { useState } from 'react';
import Register from '/components/create/register';

export default function AuthCreate(props) {
  const renderStep = () => {
    return <Register create={true} {...props} />;
  };

  return renderStep();
}
