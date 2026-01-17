import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';
import { toast } from 'sonner';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  deviceType: 'mobile' | 'desktop';
}

export function BarcodeScanner({ onScan, deviceType }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerDivId = 'barcode-reader';

  useEffect(() => {
    // Desktop: Escutar eventos de teclado do scanner USB
    if (deviceType === 'desktop' && !isScanning) {
      let buffer = '';
      let timeout: NodeJS.Timeout;

      const handleKeyPress = (e: KeyboardEvent) => {
        // Scanners USB geralmente enviam Enter ao final
        if (e.key === 'Enter') {
          if (buffer.length > 0) {
            onScan(buffer);
            toast.success(`Código lido: ${buffer}`);
            buffer = '';
          }
        } else if (e.key.length === 1) {
          // Acumula caracteres
          buffer += e.key;
          
          // Reset buffer após 100ms de inatividade
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            buffer = '';
          }, 100);
        }
      };

      window.addEventListener('keypress', handleKeyPress);

      return () => {
        window.removeEventListener('keypress', handleKeyPress);
        clearTimeout(timeout);
      };
    }
  }, [deviceType, isScanning, onScan]);

  const startScanning = async () => {
    try {
      setIsScanning(true);
      
      const html5QrCode = new Html5Qrcode(readerDivId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' }, // Câmera traseira
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText);
          toast.success(`Código lido: ${decodedText}`);
          stopScanning();
        },
        (errorMessage) => {
          // Ignora erros de leitura contínua
        }
      );
    } catch (err) {
      console.error('Erro ao iniciar scanner:', err);
      toast.error('Erro ao acessar câmera');
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error('Erro ao parar scanner:', err);
      }
    }
    setIsScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      toast.success(`Código inserido: ${manualCode}`);
      setManualCode('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Mobile: Botão para abrir câmera */}
      {deviceType === 'mobile' && !isScanning && (
        <Button
          onClick={startScanning}
          className="w-full flex items-center gap-2"
          variant="outline"
        >
          <Camera className="h-5 w-5" />
          Escanear com Câmera
        </Button>
      )}

      {/* Desktop: Indicador de scanner USB */}
      {deviceType === 'desktop' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Scanner USB Ativo:</strong> Aponte o scanner para o código de barras da vacina
          </p>
        </div>
      )}

      {/* Área de leitura da câmera */}
      {isScanning && (
        <div className="relative">
          <div id={readerDivId} className="w-full rounded-lg overflow-hidden" />
          <Button
            onClick={stopScanning}
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Fechar
          </Button>
        </div>
      )}

      {/* Entrada manual de código */}
      <form onSubmit={handleManualSubmit} className="flex gap-2">
        <input
          type="text"
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          placeholder="Ou digite o código manualmente..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button type="submit" disabled={!manualCode.trim()}>
          Adicionar
        </Button>
      </form>
    </div>
  );
}
