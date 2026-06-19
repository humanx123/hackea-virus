import { useState } from 'react';
import type { Screen, Molecule, DockingResult } from './types';
import type { Virus, ViralProtein } from './data/viruses';
import { useGamepad } from './hooks/useGamepad';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import { MatrixRain } from './components/MatrixRain';
import { GamepadStatus } from './components/GamepadStatus';
import { PresentationScreen } from './components/PresentationScreen';
import { StartScreen } from './components/StartScreen';
import { VirusSelector } from './components/VirusSelector';
import { ProteinCarousel } from './components/ProteinCarousel';
import { MoleculeSelector } from './components/MoleculeSelector';
import { BindingSiteSelector } from './components/BindingSiteSelector';
import { DockingConsoleImproved } from './components/DockingConsoleImproved';
import { ResultScreen } from './components/ResultScreen';
import { ScienceInfo } from './components/ScienceInfo';
import './styles/globals.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('presentation');
  const [selectedVirus, setSelectedVirus] = useState<Virus | null>(null);
  const [selectedProtein, setSelectedProtein] = useState<ViralProtein | null>(null);
  const [selectedMolecule, setSelectedMolecule] = useState<Molecule | null>(null);
  const [selectedBindingSite, setSelectedBindingSite] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<DockingResult | null>(null);

  const gamepadInput = useGamepad();
  const keyboardInput = useKeyboardControls();

  const handlePresentationContinue = () => {
    setCurrentScreen('start');
  };

  const handleStartClick = () => {
    setCurrentScreen('virusSelect');
  };

  const handleVirusSelect = (virus: Virus) => {
    setSelectedVirus(virus);
    setCurrentScreen('proteinSelect');
  };

  const handleProteinSelect = (protein: ViralProtein) => {
    setSelectedProtein(protein);
    setCurrentScreen('moleculeSelect');
  };

  const handleMoleculeSelect = (molecule: Molecule) => {
    setSelectedMolecule(molecule);
    setCurrentScreen('bindingSiteSelect');
  };

  const handleBindingSiteSelect = (siteId: string) => {
    setSelectedBindingSite(siteId);
    setCurrentScreen('docking');
  };

  const handleDockingComplete = (result: DockingResult) => {
    setLastResult(result);
    setCurrentScreen('results');
  };

  const handleRepeatDocking = () => {
    setCurrentScreen('moleculeSelect');
    setSelectedMolecule(null);
  };

  const handleShowInfo = () => {
    setCurrentScreen('info');
  };

  const handleCloseInfo = () => {
    setCurrentScreen('results');
  };

  const handleBackToMenu = () => {
    setCurrentScreen('presentation');
    setSelectedVirus(null);
    setSelectedProtein(null);
    setSelectedMolecule(null);
    setSelectedBindingSite(null);
    setLastResult(null);
  };

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <MatrixRain />
      <GamepadStatus gamepadInput={gamepadInput} />

      {currentScreen === 'presentation' && (
        <PresentationScreen
          onContinue={handlePresentationContinue}
          gamepadInput={gamepadInput}
          keyboardInput={keyboardInput}
        />
      )}

      {currentScreen === 'start' && (
        <StartScreen
          onStart={handleStartClick}
          gamepadInput={gamepadInput}
          keyboardInput={keyboardInput}
        />
      )}

      {currentScreen === 'virusSelect' && (
        <VirusSelector
          onSelect={handleVirusSelect}
          onCancel={handleBackToMenu}
          gamepadInput={gamepadInput}
          keyboardInput={keyboardInput}
        />
      )}

      {currentScreen === 'proteinSelect' && selectedVirus && (
        <ProteinCarousel
          virus={selectedVirus}
          onSelect={handleProteinSelect}
          onCancel={() => setCurrentScreen('virusSelect')}
          gamepadInput={gamepadInput}
          keyboardInput={keyboardInput}
        />
      )}

      {currentScreen === 'moleculeSelect' && selectedVirus && selectedProtein && (
        <MoleculeSelector
          onSelect={handleMoleculeSelect}
          onCancel={() => setCurrentScreen('proteinSelect')}
          gamepadInput={gamepadInput}
          keyboardInput={keyboardInput}
        />
      )}

      {currentScreen === 'bindingSiteSelect' && selectedVirus && selectedProtein && selectedMolecule && (
        <BindingSiteSelector
          protein={selectedProtein}
          molecule={selectedMolecule}
          onSelect={handleBindingSiteSelect}
          onCancel={() => setCurrentScreen('moleculeSelect')}
          gamepadInput={gamepadInput}
          keyboardInput={keyboardInput}
        />
      )}

      {currentScreen === 'docking' && selectedVirus && selectedProtein && selectedMolecule && selectedBindingSite && (
        <DockingConsoleImproved
          virus={selectedVirus}
          protein={selectedProtein}
          molecule={selectedMolecule}
          bindingSiteId={selectedBindingSite}
          onComplete={handleDockingComplete}
          gamepadInput={gamepadInput}
          keyboardInput={keyboardInput}
        />
      )}

      {currentScreen === 'results' && selectedVirus && selectedProtein && selectedMolecule && lastResult && (
        <ResultScreen
          molecule={selectedMolecule}
          protein={{ id: selectedProtein.id, name: selectedProtein.name } as any}
          viralProtein={selectedProtein}
          bindingSiteId={selectedBindingSite}
          result={lastResult}
          onRepeat={handleRepeatDocking}
          onInfo={handleShowInfo}
          onMenu={handleBackToMenu}
          gamepadInput={gamepadInput}
          keyboardInput={keyboardInput}
        />
      )}

      {currentScreen === 'info' && (
        <ScienceInfo
          onClose={handleCloseInfo}
          gamepadInput={gamepadInput}
          keyboardInput={keyboardInput}
        />
      )}
    </div>
  );
}

export default App;
