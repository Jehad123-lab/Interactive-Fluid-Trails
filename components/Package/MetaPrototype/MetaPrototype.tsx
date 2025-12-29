
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { 
    Code, Sliders, TerminalWindow, X, 
    ArrowsOutSimple, CornersOut, ArrowsIn,
    FileCode, Image, FileSvg, 
    Download, Upload, CaretDown, Check,
    Robot, Atom, PaintBrush, PlayCircle, Aperture
} from '@phosphor-icons/react';
import { useTheme } from '../../../theme/Theme';

// --- Types ---

interface Config {
    densityDissipation: number;
    velocityDissipation: number;
    splatRadius: number;
    sizingMode?: 'CLAMP' | 'CONTAIN' | 'COVER';
}

interface MetaPrototypeProps {
    config: Config;
    setConfig: React.Dispatch<React.SetStateAction<Config>>;
    logs: string[];
    variant: number;
    setVariant: (v: number) => void;
}

type PanelId = 'code' | 'control' | 'console';

// --- Reusable UI Components ---

const Dropdown = ({ options, value, onChange, theme }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentLabel = options.find((o: any) => o.value === value)?.label || value;

    return (
        <div ref={ref} style={{ position: 'relative', width: '100%', marginBottom: 20 }}>
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileTap={{ scale: 0.98 }}
                style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: theme.colors.base.surface[3],
                    border: `1px solid ${isOpen ? theme.colors.action.surface[1] : theme.colors.base.border}`,
                    color: theme.colors.base.content[1],
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    ...theme.typography.body.s,
                    transition: 'border-color 0.2s'
                }}
            >
                <span>{currentLabel}</span>
                <CaretDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                        transition={{ duration: 0.1 }}
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: 4,
                            background: theme.colors.base.surface[2],
                            backdropFilter: 'blur(24px)',
                            WebkitBackdropFilter: 'blur(24px)',
                            borderRadius: 8,
                            border: `1px solid ${theme.colors.base.border}`,
                            zIndex: 200,
                            overflow: 'hidden',
                            boxShadow: '0 12px 24px rgba(0,0,0,0.2)'
                        }}
                    >
                        {options.map((option: any) => (
                            <button
                                key={option.value}
                                onClick={() => { onChange(option.value); setIsOpen(false); }}
                                style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '10px 12px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: value === option.value ? theme.colors.action.surface[1] : theme.colors.base.content[2],
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    ...theme.typography.body.s,
                                    fontSize: 12
                                }}
                            >
                                {option.label}
                                {value === option.value && <Check size={12} weight="bold" />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ControlSlider = ({ label, value, min, max, step, onChange, theme }: any) => (
    <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
            <span style={{ ...theme.typography.body.s, color: theme.colors.base.content[2], fontSize: 11 }}>{label}</span>
            <span style={{ ...theme.typography.code.m, color: theme.colors.action.surface[1], fontSize: 10 }}>{value.toFixed(3)}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            style={{ 
                width: '100%', 
                cursor: 'pointer', 
                accentColor: theme.colors.action.surface[1],
                height: 4,
                borderRadius: 2
            }}
        />
    </div>
);

const SizingModeControl = ({ value, onChange, theme }: { value: string, onChange: (v: any) => void, theme: any }) => {
    const modes = [
        { id: 'CLAMP', icon: ArrowsIn, label: 'Clamp' },
        { id: 'CONTAIN', icon: CornersOut, label: 'Contain' },
        { id: 'COVER', icon: ArrowsOutSimple, label: 'Cover' },
    ];

    return (
        <div style={{ marginBottom: 24 }}>
             <span style={{ ...theme.typography.body.s, color: theme.colors.base.content[2], display: 'block', marginBottom: 12, fontSize: 11 }}>Media Sizing Mode</span>
             <div style={{ display: 'flex', gap: 8 }}>
                {modes.map((mode) => {
                    const isActive = value === mode.id;
                    const Icon = mode.icon;
                    return (
                        <button
                            key={mode.id}
                            onClick={() => onChange(mode.id)}
                            style={{
                                flex: 1,
                                background: isActive ? theme.colors.base.content[1] : theme.colors.base.surface[3],
                                border: `1px solid ${isActive ? theme.colors.base.content[1] : 'transparent'}`,
                                borderRadius: 6,
                                padding: '10px 4px',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 6,
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Icon size={18} weight={isActive ? "fill" : "regular"} color={isActive ? theme.colors.base.surface[1] : theme.colors.base.content[1]} />
                            <span style={{ 
                                ...theme.typography.body.s, 
                                fontSize: 9, 
                                fontWeight: 500,
                                color: isActive ? theme.colors.base.surface[1] : theme.colors.base.content[2] 
                            }}>
                                {mode.label.toUpperCase()}
                            </span>
                        </button>
                    )
                })}
             </div>
        </div>
    );
}

const ActionButton = ({ icon: Icon, label, theme }: any) => (
    <motion.button
        whileHover={{ scale: 1.02, backgroundColor: theme.colors.base.surface[3] }}
        whileTap={{ scale: 0.98 }}
        style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            background: 'transparent',
            border: `1px solid ${theme.colors.base.border}`,
            borderRadius: 6,
            color: theme.colors.base.content[1],
            cursor: 'pointer',
            ...theme.typography.body.s,
            fontSize: 11
        }}
    >
        <Icon size={14} />
        {label}
    </motion.button>
);

// --- Panel Contents ---

const CodeContent = ({ theme }: { theme: any }) => (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
            <span style={{ ...theme.typography.headline.s, fontSize: 10, color: theme.colors.base.content[3], marginBottom: 12, display: 'block' }}>FILE I/O</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <ActionButton icon={Upload} label="Import JSON" theme={theme} />
                <ActionButton icon={Download} label="Export GLB" theme={theme} />
                <ActionButton icon={FileSvg} label="Export SVG" theme={theme} />
                <ActionButton icon={Atom} label="React Code" theme={theme} />
            </div>
        </div>

        <div>
            <span style={{ ...theme.typography.headline.s, fontSize: 10, color: theme.colors.base.content[3], marginBottom: 12, display: 'block' }}>AI GENERATION</span>
            <div style={{ 
                background: theme.colors.base.surface[3], 
                padding: 12, 
                borderRadius: 8, 
                border: `1px solid ${theme.colors.base.border}` 
            }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
                     <Robot size={16} color={theme.colors.action.surface[1]} weight="fill" />
                     <span style={{ ...theme.typography.body.s, fontSize: 11, fontWeight: 500 }}>Prompt to Project</span>
                </div>
                <textarea
                    placeholder="Describe the fluid interaction or visual style..."
                    style={{ 
                        width: '100%', 
                        background: theme.colors.base.surface[1], 
                        border: `1px solid ${theme.colors.base.border}`, 
                        borderRadius: 4, 
                        color: theme.colors.base.content[1], 
                        padding: 8, 
                        fontSize: 11, 
                        height: 60, 
                        resize: 'none',
                        fontFamily: 'Inter, sans-serif',
                        marginBottom: 8
                    }}
                />
                <motion.button 
                    whileTap={{ scale: 0.98 }}
                    style={{ 
                        width: '100%', 
                        background: theme.colors.action.surface[1], 
                        color: '#FFF', 
                        border: 'none', 
                        borderRadius: 4, 
                        padding: '8px', 
                        fontSize: 11, 
                        fontWeight: 500,
                        cursor: 'pointer' 
                    }}
                >
                    Generate Project
                </motion.button>
            </div>
        </div>
    </div>
);

const ControlContent = ({ config, setConfig, theme, variant, setVariant }: any) => {
    const variants = [
        { value: 0, label: 'Razor (Clean)' },
        { value: 1, label: 'Soft (Smoke)' },
        { value: 2, label: 'Liquid (Refraction)' },
        { value: 3, label: 'Pressure (Debug)' },
        { value: 4, label: 'Neon (Glow)' },
    ];

    return (
        <div style={{ padding: 20 }}>
            <span style={{ ...theme.typography.body.s, color: theme.colors.base.content[2], display: 'block', marginBottom: 8, fontSize: 11 }}>Simulation Variant</span>
            <Dropdown 
                options={variants}
                value={variant}
                onChange={setVariant}
                theme={theme}
            />
            
            <SizingModeControl 
                value={config.sizingMode || 'COVER'} 
                onChange={(v: any) => setConfig((prev: Config) => ({ ...prev, sizingMode: v }))}
                theme={theme}
            />
            
            <div style={{ height: 1, background: theme.colors.base.border, margin: '20px 0' }} />
            
            <ControlSlider 
                label="Density Dissipation" 
                value={config.densityDissipation} 
                min={0.90} max={0.999} step={0.001} 
                onChange={(v: number) => setConfig((p: Config) => ({...p, densityDissipation: v}))}
                theme={theme}
            />
            <ControlSlider 
                label="Velocity Dissipation" 
                value={config.velocityDissipation} 
                min={0.0} max={0.99} step={0.01} 
                onChange={(v: number) => setConfig((p: Config) => ({...p, velocityDissipation: v}))}
                theme={theme}
            />
            <ControlSlider 
                label="Splat Radius" 
                value={config.splatRadius} 
                min={10} max={100} step={1} 
                onChange={(v: number) => setConfig((p: Config) => ({...p, splatRadius: v}))}
                theme={theme}
            />

            <div style={{ marginTop: 24 }}>
                <span style={{ ...theme.typography.headline.s, fontSize: 10, color: theme.colors.base.content[3], marginBottom: 12, display: 'block' }}>MEDIA ASSETS</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    <motion.div whileHover={{scale: 1.05}} style={{ aspectRatio: '1', background: theme.colors.base.surface[3], borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: `1px solid ${theme.colors.base.border}` }}>
                        <Image size={16} color={theme.colors.base.content[2]} />
                    </motion.div>
                    <motion.div whileHover={{scale: 1.05}} style={{ aspectRatio: '1', background: theme.colors.base.surface[3], borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: `1px solid ${theme.colors.base.border}` }}>
                        <PlayCircle size={16} color={theme.colors.base.content[2]} />
                    </motion.div>
                    <motion.div whileHover={{scale: 1.05}} style={{ aspectRatio: '1', background: theme.colors.base.surface[3], borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: `1px solid ${theme.colors.base.border}` }}>
                        <FileSvg size={16} color={theme.colors.base.content[2]} />
                    </motion.div>
                    <motion.div whileHover={{scale: 1.05}} style={{ aspectRatio: '1', background: theme.colors.base.surface[3], borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: `1px solid ${theme.colors.base.border}` }}>
                        <PaintBrush size={16} color={theme.colors.base.content[2]} />
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

const ConsoleContent = ({ logs, theme }: { logs: string[], theme: any }) => (
    <div style={{ padding: '16px 20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
         <div style={{ display: 'flex', gap: 12, marginBottom: 12, borderBottom: `1px solid ${theme.colors.base.border}`, paddingBottom: 8 }}>
            <span style={{ ...theme.typography.code.m, fontSize: 11, color: theme.colors.action.surface[1], cursor: 'pointer' }}>Logs</span>
            <span style={{ ...theme.typography.code.m, fontSize: 11, color: theme.colors.base.content[3], cursor: 'pointer' }}>FSM</span>
            <span style={{ ...theme.typography.code.m, fontSize: 11, color: theme.colors.base.content[3], cursor: 'pointer' }}>Signals</span>
         </div>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse' }}>
            {logs.map((log, i) => (
                <div key={i} style={{ 
                    ...theme.typography.code.m, 
                    padding: '4px 0', 
                    display: 'grid',
                    gridTemplateColumns: '50px 1fr',
                    gap: 12,
                    color: i === 0 ? theme.colors.base.content[1] : theme.colors.base.content[3],
                    fontSize: 10
                }}>
                    <span style={{ opacity: 0.5 }}>{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}</span>
                    <span>{log}</span>
                </div>
            ))}
        </div>
    </div>
);

// --- Window & Dock Components ---

interface WindowProps {
    id: string;
    title: string;
    icon: any;
    children: React.ReactNode;
    theme: any;
    onClose: () => void;
    onFocus: () => void;
    zIndex: number;
    width: string;
    height: string | number;
}

const Window: React.FC<WindowProps> = ({ id, title, icon: Icon, children, theme, onClose, onFocus, zIndex, width, height }) => {
    const dragControls = useDragControls();

    return (
        <motion.div
            drag
            dragControls={dragControls}
            dragMomentum={false}
            dragElastic={0.1}
            onPointerDown={onFocus}
            initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%", filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%", filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%", filter: "blur(8px)", transition: { duration: 0.15 } }}
            style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                width: width,
                maxWidth: '90vw',
                height: height,
                maxHeight: '80vh',
                background: 'rgba(15, 15, 15, 0.65)',
                backdropFilter: 'blur(32px)',
                WebkitBackdropFilter: 'blur(32px)',
                borderRadius: 16,
                border: `1px solid rgba(255,255,255,0.08)`,
                boxShadow: '0 32px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset',
                zIndex: zIndex,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                userSelect: 'none'
            }}
        >
            {/* Header / Drag Handle */}
            <div 
                onPointerDown={(e) => dragControls.start(e)}
                style={{ 
                    height: 44, 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '0 6px',
                    borderBottom: `1px solid ${theme.colors.base.border}`,
                    cursor: 'grab',
                    background: 'rgba(255,255,255,0.02)',
                    touchAction: 'none'
                }}
            >
                <div style={{ 
                    flex: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 10, 
                    paddingLeft: 14,
                    ...theme.typography.headline.s,
                    fontSize: 11,
                    letterSpacing: '0.02em',
                    color: theme.colors.base.content[1],
                    pointerEvents: 'none'
                }}>
                    <Icon size={14} weight="fill" style={{ opacity: 0.7 }} />
                    {title.toUpperCase()}
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        border: 'none',
                        background: 'transparent',
                        color: theme.colors.base.content[2],
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.feedback.error}
                    onMouseLeave={(e) => e.currentTarget.style.color = theme.colors.base.content[2]}
                >
                    <X size={14} weight="bold" />
                </button>
            </div>
            
            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', pointerEvents: 'auto' }}>
                {children}
            </div>
        </motion.div>
    );
};

const DockItem = ({ icon: Icon, label, isOpen, onClick, theme }: any) => (
    <motion.div
        onClick={onClick}
        onHoverStart={(e) => {}}
        whileHover={{ scale: 1.1, y: -5 }}
        whileTap={{ scale: 0.95 }}
        style={{
            position: 'relative',
            width: 48,
            height: 48,
            borderRadius: 12,
            background: isOpen 
                ? `linear-gradient(135deg, ${theme.colors.base.surface[3]}, ${theme.colors.base.surface[2]})` 
                : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.3s',
            flexDirection: 'column'
        }}
    >
        <div style={{ 
            width: 40, 
            height: 40, 
            borderRadius: 10, 
            background: 'rgba(255,255,255,0.05)', 
            border: `1px solid rgba(255,255,255,0.08)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isOpen ? '0 4px 12px rgba(0,0,0,0.2)' : 'none'
        }}>
            <Icon size={22} weight={isOpen ? "fill" : "regular"} color={isOpen ? theme.colors.action.surface[1] : theme.colors.base.content[1]} />
        </div>
        {isOpen && (
            <div style={{ 
                position: 'absolute', 
                bottom: -6, 
                width: 4, 
                height: 4, 
                borderRadius: 2, 
                background: theme.colors.base.content[1] 
            }} />
        )}
    </motion.div>
);

const Dock = ({ panels, togglePanel, theme }: any) => {
    const items = [
        { id: 'code', icon: Code, label: 'Code' },
        { id: 'control', icon: Sliders, label: 'Control' },
        { id: 'console', icon: TerminalWindow, label: 'Console' },
    ];

    return (
        <div style={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 12,
            padding: '10px 16px',
            background: 'rgba(10, 10, 10, 0.5)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 20,
            border: `1px solid rgba(255,255,255,0.1)`,
            boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,1.0)',
            zIndex: 900
        }}>
            {items.map(item => (
                <DockItem
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    isOpen={panels[item.id]}
                    onClick={() => togglePanel(item.id)}
                    theme={theme}
                />
            ))}
        </div>
    )
}

// --- Main Component ---

const MetaPrototype: React.FC<MetaPrototypeProps> = ({ config, setConfig, logs, variant, setVariant }) => {
    const theme = useTheme();
    
    const [panels, setPanels] = useState<Record<string, boolean>>({
        code: false,
        control: false,
        console: false
    });

    // Track focus order for z-index management
    const [focusOrder, setFocusOrder] = useState<string[]>(['code', 'control', 'console']);

    const togglePanel = (id: string) => {
        setPanels(prev => ({ ...prev, [id]: !prev[id] }));
        if (!panels[id]) bringToFront(id);
    };

    const bringToFront = (id: string) => {
        setFocusOrder(prev => [...prev.filter(p => p !== id), id]);
    };

    const getZIndex = (id: string) => {
        return 100 + focusOrder.indexOf(id);
    };

    return (
        <>
            <AnimatePresence>
                {panels.code && (
                    <Window 
                        id="code" 
                        title="Code I/O" 
                        icon={Code} 
                        theme={theme} 
                        onClose={() => togglePanel('code')} 
                        onFocus={() => bringToFront('code')}
                        zIndex={getZIndex('code')}
                        width="380px"
                        height="520px"
                    >
                        <CodeContent theme={theme} />
                    </Window>
                )}
                {panels.control && (
                    <Window 
                        id="control" 
                        title="Control" 
                        icon={Sliders} 
                        theme={theme} 
                        onClose={() => togglePanel('control')} 
                        onFocus={() => bringToFront('control')}
                        zIndex={getZIndex('control')}
                        width="320px"
                        height="580px"
                    >
                        <ControlContent config={config} setConfig={setConfig} theme={theme} variant={variant} setVariant={setVariant} />
                    </Window>
                )}
                {panels.console && (
                    <Window 
                        id="console" 
                        title="Console" 
                        icon={TerminalWindow} 
                        theme={theme} 
                        onClose={() => togglePanel('console')} 
                        onFocus={() => bringToFront('console')}
                        zIndex={getZIndex('console')}
                        width="500px"
                        height="300px"
                    >
                        <ConsoleContent logs={logs} theme={theme} />
                    </Window>
                )}
            </AnimatePresence>
            
            <Dock panels={panels} togglePanel={togglePanel} theme={theme} />
        </>
    );
};

export default MetaPrototype;
