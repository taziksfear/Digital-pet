import React from 'react';
import MainScreen from '../components/MainScreen';

export default function HomeView({ costume, character }) {
    return <MainScreen state="idle" costume={costume} character={character} />;
}