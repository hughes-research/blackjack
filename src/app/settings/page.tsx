'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useSettings } from '@/hooks/useBlackjack';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Settings as SettingsType, DEFAULT_SETTINGS } from '@/types/game';
import { 
  Layers, 
  AlertTriangle, 
  Percent, 
  Flag, 
  Copy, 
  Zap,
  Save,
  RotateCcw,
  Home,
  Check,
  Settings as SettingsIcon,
  RefreshCw
} from 'lucide-react';

/**
 * Toggle switch component.
 */
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function ToggleSwitch({ checked, onChange, disabled = false }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`
        relative w-12 h-6 rounded-full transition-colors duration-200
        ${checked ? 'bg-gold' : 'bg-casino-green-dark'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        border border-gold/30
      `}
    >
      <motion.div
        className={`
          absolute top-0.5 w-5 h-5 rounded-full
          ${checked ? 'bg-rich-black' : 'bg-cream/50'}
        `}
        animate={{ left: checked ? '1.5rem' : '0.125rem' }}
        transition={{ duration: 0.2 }}
      />
    </button>
  );
}

/**
 * Setting row component.
 */
interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  children: React.ReactNode;
}

function SettingRow({ icon, label, description, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-gold/10">
      <div className="flex items-start gap-3">
        <div className="text-gold/60 mt-1">{icon}</div>
        <div>
          <h3 className="text-cream font-display font-semibold">{label}</h3>
          <p className="text-cream/50 text-sm">{description}</p>
        </div>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

/**
 * Slider component for numeric settings.
 */
interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

function Slider({ value, min, max, step = 1, onChange }: SliderProps) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-32 h-2 bg-casino-green-dark rounded-lg appearance-none cursor-pointer
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-4
                   [&::-webkit-slider-thumb]:h-4
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-gold
                   [&::-webkit-slider-thumb]:cursor-pointer
                   [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(212,175,55,0.5)]"
      />
      <span className="text-gold font-display font-bold w-8 text-center">{value}</span>
    </div>
  );
}

/**
 * Radio group component.
 */
interface RadioGroupProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

function RadioGroup<T extends string>({ value, options, onChange }: RadioGroupProps<T>) {
  return (
    <div className="flex gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            px-3 py-1.5 rounded text-sm font-display transition-all
            ${value === option.value
              ? 'bg-gold text-rich-black font-bold'
              : 'bg-casino-green-dark/50 text-cream/70 hover:bg-casino-green-dark'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Settings page component.
 */
export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState<SettingsType>(settings);
  const [saved, setSaved] = useState(false);
  
  // Sync local settings when store changes
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);
  
  const handleChange = <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };
  
  const handleSave = () => {
    updateSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  
  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
    updateSettings(DEFAULT_SETTINGS);
    setSaved(false);
  };
  
  const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(settings);
  
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <Image
        src="/58471.jpg"
        alt="Casino felt background"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/60" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-gold/20">
          <Breadcrumbs items={[{ label: 'Settings' }]} />
          
          <Link href="/">
            <motion.button
              className="p-2 bg-black/30 rounded-full text-gold/70 hover:text-gold hover:bg-black/50 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Home className="w-5 h-5" />
            </motion.button>
          </Link>
        </header>
        
        {/* Settings Content */}
        <div className="max-w-2xl mx-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 backdrop-blur-sm rounded-lg border border-gold/20 overflow-hidden"
          >
            {/* Title */}
            <div className="p-6 border-b border-gold/20">
              <div className="flex items-center gap-3">
                <SettingsIcon className="w-6 h-6 text-gold" />
                <h1 className="text-gold font-display text-2xl font-bold">Game Settings</h1>
              </div>
              <p className="text-cream/50 mt-2">
                Customize your blackjack experience
              </p>
            </div>
            
            {/* Settings List */}
            <div className="p-6 space-y-2">
              {/* Number of Decks */}
              <SettingRow
                icon={<Layers className="w-5 h-5" />}
                label="Number of Decks"
                description="How many decks in the shoe (1-8)"
              >
                <Slider
                  value={localSettings.numberOfDecks}
                  min={1}
                  max={8}
                  onChange={(v) => handleChange('numberOfDecks', v)}
                />
              </SettingRow>
              
              {/* Dealer Hits Soft 17 */}
              <SettingRow
                icon={<AlertTriangle className="w-5 h-5" />}
                label="Dealer Hits Soft 17"
                description="Dealer draws on soft 17 (ace + 6)"
              >
                <ToggleSwitch
                  checked={localSettings.dealerHitsSoft17}
                  onChange={(v) => handleChange('dealerHitsSoft17', v)}
                />
              </SettingRow>
              
              {/* Blackjack Payout */}
              <SettingRow
                icon={<Percent className="w-5 h-5" />}
                label="Blackjack Payout"
                description="Payout ratio for natural blackjack"
              >
                <RadioGroup
                  value={localSettings.blackjackPays}
                  options={[
                    { value: '3:2', label: '3:2' },
                    { value: '6:5', label: '6:5' },
                  ]}
                  onChange={(v) => handleChange('blackjackPays', v)}
                />
              </SettingRow>
              
              {/* Allow Surrender */}
              <SettingRow
                icon={<Flag className="w-5 h-5" />}
                label="Allow Surrender"
                description="Option to surrender and lose half bet"
              >
                <ToggleSwitch
                  checked={localSettings.allowSurrender}
                  onChange={(v) => handleChange('allowSurrender', v)}
                />
              </SettingRow>
              
              {/* Double After Split */}
              <SettingRow
                icon={<Copy className="w-5 h-5" />}
                label="Double After Split"
                description="Allow double down on split hands"
              >
                <ToggleSwitch
                  checked={localSettings.allowDoubleAfterSplit}
                  onChange={(v) => handleChange('allowDoubleAfterSplit', v)}
                />
              </SettingRow>
              
              {/* Animation Speed */}
              <SettingRow
                icon={<Zap className="w-5 h-5" />}
                label="Animation Speed"
                description="Speed of card dealing animations"
              >
                <RadioGroup
                  value={localSettings.animationSpeed}
                  options={[
                    { value: 'slow', label: 'Slow' },
                    { value: 'normal', label: 'Normal' },
                    { value: 'fast', label: 'Fast' },
                  ]}
                  onChange={(v) => handleChange('animationSpeed', v)}
                />
              </SettingRow>
              
              {/* Allow Restart */}
              <SettingRow
                icon={<RefreshCw className="w-5 h-5" />}
                label="Allow Restart"
                description="Reset game and start over when you go broke"
              >
                <ToggleSwitch
                  checked={localSettings.allowRebuy}
                  onChange={(v) => handleChange('allowRebuy', v)}
                />
              </SettingRow>
            </div>
            
            {/* Actions */}
            <div className="flex items-center justify-between p-6 bg-black/20 border-t border-gold/20">
              <motion.button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-cream/60 hover:text-cream transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Defaults
              </motion.button>
              
              <motion.button
                onClick={handleSave}
                disabled={!hasChanges && !saved}
                className={`
                  flex items-center gap-2 px-6 py-2 rounded font-display font-bold tracking-wider
                  ${saved
                    ? 'bg-green-600 text-white'
                    : hasChanges
                      ? 'bg-gradient-to-r from-gold-dark via-gold to-gold-dark text-rich-black'
                      : 'bg-casino-green-dark/50 text-cream/50 cursor-not-allowed'
                  }
                  transition-all
                `}
                whileHover={hasChanges ? { scale: 1.02 } : {}}
                whileTap={hasChanges ? { scale: 0.98 } : {}}
              >
                {saved ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
          
          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 p-4 bg-gold/10 rounded-lg border border-gold/20"
          >
            <h3 className="text-gold font-display font-semibold mb-2">House Edge Info</h3>
            <ul className="text-cream/60 text-sm space-y-1">
              <li>6 decks with 3:2 blackjack: ~0.5% house edge</li>
              <li>6:5 blackjack increases house edge by ~1.4%</li>
              <li>Dealer hitting soft 17 increases edge by ~0.2%</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

