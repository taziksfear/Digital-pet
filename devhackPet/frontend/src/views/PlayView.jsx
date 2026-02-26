import React from 'react';
import MainScreen from '../components/MainScreen';

export default function PlayView({ costume, character }) {
    return <MainScreen state="play" costume={costume} character={character} />;
}