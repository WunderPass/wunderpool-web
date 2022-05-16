import Link from 'next/link';
import { slide as Menu } from 'react-burger-menu';
import styled from 'styled-components';
import React, { Component } from 'react';

const StyledAnchor = styled.a`
  padding: 1rem 3rem;
  display: flex;
  align-items: center;
  position: relative;
  text-transform: uppercase;
  font-weight: 900;
  font-size: 1em;
  background: none;
  border: 0;
  cursor: pointer;
  color: #fffafa;
`;

export default function Burger(props) {
  return (
    <Menu noOverlay width={280} isOpen={true}>
      <Link href={`/pools`}></Link> <Link href={`/pools`}></Link>
    </Menu>
  );
}
