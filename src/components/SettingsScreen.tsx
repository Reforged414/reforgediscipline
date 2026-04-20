import { useState } from 'react';
import { ArrowLeft, ChevronRight, ExternalLink, Mail, Shield, FileText, Bell, Pencil, LogOut, Trash2, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import EditAnswersScreen from './EditAnswersScreen';

const SUPPORT_EMAIL = 'support@reforgediscipline.app';
const PRIVACY_URL = 'https://reforgediscipline.lovable.app/privacy';
const TERMS_URL = 'https://reforgediscipline.lovable.app/terms';

interface Props {
  onBack: () => void;
}

type Subview = 'main' | 'editAnswers' | 'webview';

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] tracking-[0.3em] uppercase text-primary font-semibold mb-3 px-1">{children}</p>
);

const Row = ({
  icon: Icon,
  label,
  value,
  onClick,
  destructive,
  trailing,
}: {
  icon?: any;
  label: string;
  value?: string;
  onClick?: () => void;
  destructive?: boolean;
  trailing?: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    disabled={!onClick && !trailing}
    className={`w-full flex items-center gap-3 bg-secondary rounded-xl px-4 py-3.5 text-left ${
      onClick ? 'active:scale-[0.99] transition-transform' : ''
    }`}
  >
    {Icon && (
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${destructive ? 'bg-destructive/15' : 'bg-primary/15'}`}>
        <Icon size={16} className={destructive ? 'text-destructive' : 'text-primary'} />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className={`text-sm ${destructive ? 'text-destructive' : 'text-foreground'}`}>{label}</p>
      {value && <p className="text-xs text-muted-foreground truncate mt-0.5">{value}</p>}
    </div>
    {trailing ?? (onClick ? <ChevronRight size={18} className="text-muted-foreground" /> : null)}
  </button>
);

const SettingsScreen = ({ onBack }: Props) => {
  const { user, isGuest, signOut } = useAuth();
  const { notificationPrefs, updateNotificationPrefs, resetAllLocalData } = useAppStore();

  const [view, setView] = useState<Subview>('main');
  const [webviewUrl, setWebviewUrl] = useState<string | null>(null);
  const [webviewTitle, setWebviewTitle] = useState('');

  // Username dialog
  const [usernameOpen, setUsernameOpen] = useState(false);
  const [newUsername, setNewUsername] = useState((user?.user_metadata as any)?.username || '');

  // Email dialog
  const [emailOpen, setEmailOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const username =
    (user?.user_metadata as any)?.username ||
    (user?.user_metadata as any)?.full_name ||
    user?.email?.split('@')[0] ||
    (isGuest ? 'Guest' : '—');
  const email = user?.email ?? (isGuest ? 'Guest mode' : '—');

  const openWebview = (url: string, title: string) => {
    setWebviewUrl(url);
    setWebviewTitle(title);
    setView('webview');
  };

  const handleSaveUsername = async () => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Create an account to change your username.' });
      return;
    }
    const { error } = await supabase.auth.updateUser({ data: { username: newUsername } });
    if (error) {
      toast({ title: 'Could not update username', description: error.message, variant: 'destructive' });
      return;
    }
    await supabase.from('profiles').update({ display_name: newUsername }).eq('user_id', user.id);
    toast({ title: 'Username updated' });
    setUsernameOpen(false);
  };

  const handleSaveEmail = async () => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Create an account to change your email.' });
      return;
    }
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) {
      toast({ title: 'Could not update email', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Check your inbox', description: 'Confirm the change from the verification email.' });
    setEmailOpen(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      if (user) {
        const { error } = await supabase.functions.invoke('delete-account');
        if (error) throw error;
      }
      resetAllLocalData();
      localStorage.removeItem('reforged-guest');
      await signOut();
      toast({ title: 'Account deleted' });
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err.message ?? 'Try again later.', variant: 'destructive' });
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({ title: 'Signed out' });
  };

  if (view === 'editAnswers') {
    return <EditAnswersScreen onBack={() => setView('main')} />;
  }

  if (view === 'webview' && webviewUrl) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center gap-3 px-5 pt-6 pb-4 border-b border-border">
          <button onClick={() => setView('main')} className="text-foreground p-1" aria-label="Back">
            <ArrowLeft size={22} />
          </button>
          <h1 className="font-display text-base tracking-wider text-foreground flex-1">{webviewTitle}</h1>
          <a href={webviewUrl} target="_blank" rel="noreferrer" className="text-primary p-1" aria-label="Open externally">
            <ExternalLink size={18} />
          </a>
        </div>
        <iframe src={webviewUrl} title={webviewTitle} className="flex-1 w-full bg-background" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="flex items-center gap-3 px-5 pt-6 pb-4">
        <button onClick={onBack} className="text-foreground p-1" aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <h1 className="font-display text-xl tracking-wider text-foreground">Settings</h1>
      </div>

      {/* ACCOUNT */}
      <div className="px-5 mt-2">
        <SectionLabel>Account</SectionLabel>
        <div className="space-y-2">
          <Row icon={User} label="Username" value={username} />
          <Row icon={Mail} label="Email" value={email} />
          <Row
            icon={Pencil}
            label="Change username"
            onClick={() => {
              setNewUsername(username === '—' ? '' : username);
              setUsernameOpen(true);
            }}
          />
          <Row
            icon={Mail}
            label="Change email"
            onClick={() => {
              setNewEmail('');
              setEmailOpen(true);
            }}
          />
        </div>
      </div>

      <div className="h-px bg-border mx-5 my-6" />

      {/* PREFERENCES */}
      <div className="px-5">
        <SectionLabel>Preferences</SectionLabel>
        <div className="space-y-2">
          <Row icon={Pencil} label="Edit my answers" value="Goals, triggers, severity, last relapse" onClick={() => setView('editAnswers')} />
          <div className="bg-secondary rounded-xl px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/15">
                <Bell size={16} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground">Daily check-in reminder</p>
                <p className="text-xs text-muted-foreground mt-0.5">Get a nudge to keep your streak alive</p>
              </div>
              <Switch
                checked={notificationPrefs.dailyCheckInEnabled}
                onCheckedChange={(checked) => updateNotificationPrefs({ dailyCheckInEnabled: checked })}
              />
            </div>
            {notificationPrefs.dailyCheckInEnabled && (
              <div className="flex items-center justify-between pl-11 pt-3 mt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">Reminder time</span>
                <input
                  type="time"
                  value={notificationPrefs.dailyCheckInTime}
                  onChange={(e) => updateNotificationPrefs({ dailyCheckInTime: e.target.value })}
                  className="bg-background border border-border rounded-md px-2 py-1 text-sm text-foreground"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-px bg-border mx-5 my-6" />

      {/* SUPPORT */}
      <div className="px-5">
        <SectionLabel>Support</SectionLabel>
        <div className="space-y-2">
          <Row icon={Shield} label="Privacy Policy" onClick={() => openWebview(PRIVACY_URL, 'Privacy Policy')} />
          <Row icon={FileText} label="Terms of Service" onClick={() => openWebview(TERMS_URL, 'Terms of Service')} />
          <Row
            icon={Mail}
            label="Contact / Send Feedback"
            value={SUPPORT_EMAIL}
            onClick={() => {
              window.location.href = `mailto:${SUPPORT_EMAIL}?subject=Reforged%20Feedback`;
            }}
          />
        </div>
      </div>

      <div className="h-px bg-border mx-5 my-6" />

      {/* DANGER ZONE */}
      <div className="px-5">
        <SectionLabel>Danger Zone</SectionLabel>
        <div className="space-y-2">
          <Row icon={LogOut} label="Sign out" onClick={handleSignOut} />
          <Row icon={Trash2} label="Delete account" destructive onClick={() => { setDeleteConfirm(''); setDeleteOpen(true); }} />
        </div>
      </div>

      {/* Username dialog */}
      <Dialog open={usernameOpen} onOpenChange={setUsernameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change username</DialogTitle>
            <DialogDescription>This is how you appear in the app.</DialogDescription>
          </DialogHeader>
          <Input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="username" />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setUsernameOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveUsername} disabled={!newUsername.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email dialog */}
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change email</DialogTitle>
            <DialogDescription>We'll send a confirmation link to your new address.</DialogDescription>
          </DialogHeader>
          <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="you@example.com" />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEmailOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEmail} disabled={!newEmail.includes('@')}>Send confirmation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete account permanently</DialogTitle>
            <DialogDescription>
              This wipes your streak, journal, urge logs, and all stored data. This action cannot be undone.
              Type <span className="font-bold text-foreground">DELETE</span> to confirm.
            </DialogDescription>
          </DialogHeader>
          <Input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="DELETE" />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteConfirm !== 'DELETE' || deleting}>
              {deleting ? 'Deleting…' : 'Delete forever'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsScreen;
