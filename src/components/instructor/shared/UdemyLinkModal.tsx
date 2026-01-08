import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';
import { API_BASE_URL } from '@/config/env';

interface UdemyLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function UdemyLinkModal({ isOpen, onClose }: UdemyLinkModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!clientId || !clientSecret || !apiKey) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/api/v1/instructor/link-udemy`, {
        clientId,
        clientSecret,
        apiKey
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: "Success", description: "Udemy account linked successfully" });
      onClose();
      setClientId('');
      setClientSecret('');
      setApiKey('');
    } catch (error: any) {
      console.error(error);
      toast({ title: "Error", description: error.response?.data?.message || "Failed to link account", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ربط حساب Udemy</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Udemy Client ID</label>
            <Input
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Enter Client ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Udemy Client Secret</label>
            <Input
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="Enter Client Secret"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">API Key</label>
            <Input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter API Key"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline" disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Linking..." : "Link Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
