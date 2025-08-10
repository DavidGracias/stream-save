import React, { useState, useEffect, useMemo } from 'react';
import { generateUrl, generateMongoUrl } from '../utils';
import {
  Container,
  Card,
  CardContent,
} from '@mui/material';
import type { MongoDBCredentials, FormData } from '../types';
import {
  ConfigureHeader,
  CredentialsForm,
  ConnectionUrlForm,
  InstallationSection,
  ActionButtons,
  HelpDialog,
  SuccessSnackbar,
} from '../components/Configure';

interface ConfigureProps {
  mongoDBCred: MongoDBCredentials;
  setMongoDBCred: React.Dispatch<React.SetStateAction<MongoDBCredentials>>;
}

const Configure: React.FC<ConfigureProps> = ({ mongoDBCred, setMongoDBCred }) => {
  const [formData, setFormData] = useState<FormData>({
    user: mongoDBCred.user || '',
    pass: mongoDBCred.pass || '',
    cluster: mongoDBCred.cluster || '',
    db_url: generateUrl(mongoDBCred)
  });

  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  // Generate installation URL for the current credentials
  const installUrl = useMemo(() => {
    if (formData.user && formData.pass && formData.cluster) {
      const host = window.location.origin;
      return `${host}/${formData.user}/${formData.pass}/${formData.cluster}/manifest.json`;
    }
    return '';
  }, [formData.user, formData.pass, formData.cluster]);

  useEffect(() => {
    setFormData({
      user: mongoDBCred.user || '',
      pass: mongoDBCred.pass || '',
      cluster: mongoDBCred.cluster || '',
      db_url: mongoDBCred.user && mongoDBCred.pass && mongoDBCred.cluster ? generateUrl(mongoDBCred) : ''
    });
  }, [mongoDBCred]);

  // Prefill from query parameters (?user=&passw=&cluster=) to match legacy behavior
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qpUser = params.get('user');
    const qpPass = params.get('passw');
    const qpCluster = params.get('cluster');
    if (qpUser || qpPass || qpCluster) {
      const user = qpUser || '';
      const pass = qpPass || '';
      const cluster = qpCluster || '';
      const url = generateMongoUrl(user, pass, cluster);
      setFormData({ user, pass, cluster, db_url: url });
      setMongoDBCred({ user, pass, cluster });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Parse MongoDB URL into individual components
  const parseMongoUrl = (url: string): { user: string; pass: string; cluster: string } => {
    try {
      // Handle mongodb+srv:// format
      const match = url.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^.]+)/);
      if (match) {
        return {
          user: match[1],
          pass: match[2],
          cluster: match[3]
        };
      }
      return { user: '', pass: '', cluster: '' };
    } catch (error) {
      return { user: '', pass: '', cluster: '' };
    }
  };

  // Handle URL change and parse into individual fields
  const handleUrlChange = (url: string): void => {
    setFormData(prev => ({ ...prev, db_url: url }));

    if (url && url.includes('mongodb+srv://')) {
      const parsed = parseMongoUrl(url);
      setFormData(prev => ({
        ...prev,
        user: parsed.user,
        pass: parsed.pass,
        cluster: parsed.cluster,
        db_url: url
      }));

      // Update MongoDB credentials state immediately
      setMongoDBCred({
        user: parsed.user,
        pass: parsed.pass,
        cluster: parsed.cluster
      });
    }
  };

  // Handle individual field changes and update URL
  const handleIndividualFieldChange = (field: string, value: string): void => {
    const newFormData = { ...formData, [field]: value };
    const url = generateMongoUrl(newFormData.user, newFormData.pass, newFormData.cluster);
    setFormData({ ...newFormData, db_url: url });
  };

  // Check if credentials are the original null ones
  const areCredentialsOriginal = (): boolean => {
    return !mongoDBCred.user && !mongoDBCred.pass && !mongoDBCred.cluster;
  };

  // Copy installation URL to clipboard
  const handleCopyInstallUrl = async () => {
    if (installUrl) {
      try {
        await navigator.clipboard.writeText(installUrl);
        setSuccessMessage('Installation URL copied');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  // Open Stremio deep link
  const openStremioLink = () => {
    if (formData.user && formData.pass && formData.cluster) {
      const stremioDeepLink = `stremio://${window.location.host}/${formData.user}/${formData.pass}/${formData.cluster}/manifest.json`;
      setSuccessMessage('Opening in Stremio...');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      window.location.href = stremioDeepLink;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <ConfigureHeader />

      {/* Form Content */}
      <Card elevation={0} sx={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d2d 100%)',
        border: '1px solid #2d2d2d',
        borderRadius: 3,
      }}>
        <CardContent sx={{ p: 4 }}>
          <CredentialsForm
            formData={formData}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            onFieldChange={handleIndividualFieldChange}
          />

          <ConnectionUrlForm
            formData={formData}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            onUrlChange={handleUrlChange}
          />

          <InstallationSection
            installUrl={installUrl}
            formData={formData}
            showPassword={showPassword}
            onOpenInStremio={openStremioLink}
            onCopyUrl={handleCopyInstallUrl}
          />

          <ActionButtons
            onShowHelp={() => setShowHelp(true)}
            onUpdateCredentials={() => {
              setMongoDBCred({
                user: formData.user,
                pass: formData.pass,
                cluster: formData.cluster
              });
              const message = areCredentialsOriginal() ? 'Credentials have been saved' : 'Credentials have been updated';
              setSuccessMessage(message);
              setShowSuccess(true);
              setTimeout(() => setShowSuccess(false), 2000);
            }}
            areCredentialsOriginal={areCredentialsOriginal()}
            isFormValid={!!(formData.user && formData.pass && formData.cluster)}
          />
        </CardContent>
      </Card>

      <HelpDialog
        open={showHelp}
        onClose={() => setShowHelp(false)}
      />

      <SuccessSnackbar
        open={showSuccess}
        message={successMessage}
        onClose={() => setShowSuccess(false)}
      />
    </Container>
  );
};

export default Configure;
