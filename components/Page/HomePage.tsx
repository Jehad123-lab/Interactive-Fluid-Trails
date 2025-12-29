
import React, { useState, useCallback } from 'react';
import FluidCanvas from '../Core/FluidCanvas/FluidCanvas';
import MetaPrototype from '../Package/MetaPrototype/MetaPrototype';
import { useTheme } from '../../theme/Theme';
import { motion } from 'framer-motion';
import { Sun, Moon } from '@phosphor-icons/react';

interface HeaderProps {
    toggleTheme: () => void;
    currentTheme: string;
}

const Header: React.FC<HeaderProps> = ({ toggleTheme, currentTheme }) => {
    const theme = useTheme();
    const style = {
        position: 'absolute' as const,
        top: 24,
        left: 24,
        zIndex: 10,
        pointerEvents: 'none' as const,
        textShadow: '0 2px 10px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        width: 'calc(100% - 48px)',
        justifyContent: 'space-between'
    };

    return (
        <header style={style}>
            <h1 style={{ 
                ...theme.typography.headline.m, 
                margin: 0, 
                color: 'rgba(255,255,255,0.9)', 
                fontWeight: 300,
                letterSpacing: '-0.5px'
            }}>
                Fluid Interaction <span style={{ opacity: 0.4, fontWeight: 400 }}>09</span>
            </h1>
            <button 
                onClick={toggleTheme}
                style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    pointerEvents: 'auto',
                    color: '#FFF',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                }}
            >
                {currentTheme === 'dark' ? <Moon size={20} weight="fill" /> : <Sun size={20} weight="fill" />}
            </button>
        </header>
    );
};

interface Config {
    densityDissipation: number;
    velocityDissipation: number;
    splatRadius: number;
    sizingMode?: 'CLAMP' | 'CONTAIN' | 'COVER';
}

interface HomePageProps {
    toggleTheme: () => void;
    currentTheme: string;
}

const HomePage: React.FC<HomePageProps> = ({ toggleTheme, currentTheme }) => {
    const theme = useTheme();
    
    const [config, setConfig] = useState<Config>({
        densityDissipation: 0.97, 
        velocityDissipation: 0.05,
        splatRadius: 40,
        sizingMode: 'COVER'
    });

    const [variant, setVariant] = useState(0);
    const [logs, setLogs] = useState<string[]>(["SYSTEM_READY", "MODE: RAZOR_CLEAN"]);

    const handleLog = useCallback((msg: string) => {
        setLogs(prev => [msg, ...prev].slice(0, 50));
    }, []);

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', backgroundColor: theme.colors.base.surface[1], overflow: 'hidden' }}>
            <FluidCanvas config={config} onLog={handleLog} variant={variant} />
            <Header toggleTheme={toggleTheme} currentTheme={currentTheme} />
            <MetaPrototype 
                config={config} 
                setConfig={setConfig} 
                logs={logs} 
                variant={variant}
                setVariant={setVariant}
            />
        </div>
    );
};

export default HomePage;
