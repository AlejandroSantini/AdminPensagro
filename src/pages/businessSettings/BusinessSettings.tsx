
import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Divider, CircularProgress, Alert } from '@mui/material';
import { SimpleTabs } from '../../components/common/SimpleTabs';
import GeneralTab from './components/GeneralTab';
import PopupTab from './components/PopupTab';
import { ContainedButton } from '../../components/common/ContainedButton';
import { useForm, useFieldArray } from 'react-hook-form';
import api from '../../services/api';
import { getConfigRoute, putConfigRoute } from '../../services/config';

interface BusinessSettingsForm {
  usd_ars_rate: string;
  cbus: { alias: string; cbu: string }[];
  pickup_address: string;
  free_shipping_threshold_retailer: string;
  free_shipping_threshold_wholesaler: string;
  purchase_notify_emails: { email: string }[];
  popup: {
    content_type: string;
    link: string;
    link_open_type: string;
    status: string;
    image?: string;
  };
}

const DEFAULT_VALUES: BusinessSettingsForm = {
  usd_ars_rate: '',
  cbus: [{ alias: '', cbu: '' }],
  pickup_address: '',
  free_shipping_threshold_retailer: '',
  free_shipping_threshold_wholesaler: '',
  purchase_notify_emails: [{ email: '' }],
  popup: {
    content_type: 'image',
    link: '',
    link_open_type: 'same_tab',
    status: 'inactive',
    image: '',
  },
};
export default function BusinessSettings() {
  const [loading, setLoading] = useState(false);
  const [saveLoadingGeneral, setSaveLoadingGeneral] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  
  const { handleSubmit, control, reset, setValue, watch, formState: { errors }, getValues } = useForm<BusinessSettingsForm>({
    defaultValues: DEFAULT_VALUES,
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'purchase_notify_emails',
  });

  const { fields: cbusFields, append: appendCbu, remove: removeCbu } = useFieldArray({
    control,
    name: 'cbus',
  });

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(getConfigRoute());
      if (response.data && response.data.status === true) {
        const config = response.data.data;
        
        const emailsArray = Array.isArray(config.purchase_notify_emails) 
          ? config.purchase_notify_emails.map((email: string) => ({ email }))
          : [{ email: '' }];
        // support both legacy single cbu/alias and new cbus array
        const cbusArray = Array.isArray(config.cbus)
          ? config.cbus.map((it: any) => ({ alias: it.alias || '', cbu: it.cbu || '' }))
          : (config.cbu || config.alias)
            ? [{ alias: config.alias || '', cbu: config.cbu || '' }]
            : [{ alias: '', cbu: '' }];

        reset({
          usd_ars_rate: config.usd_ars_rate || '',
          cbus: cbusArray,
          pickup_address: config.pickup_address || '',
          free_shipping_threshold_retailer: config.free_shipping_threshold_retailer || '',
          free_shipping_threshold_wholesaler: config.free_shipping_threshold_wholesaler || '',
          purchase_notify_emails: emailsArray,
          popup: config.popup || DEFAULT_VALUES.popup,
        });
      } else {
        setError('No se pudo cargar la configuración');
      }
    } catch (err) {
      console.error('Error loading config:', err);
      setError('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const onSaveGeneral = async () => {
    setSaveLoadingGeneral(true);
    setError(null);
    setSaveSuccess(false);
    
    try {
      const data = getValues();
      const payload = {
        usd_ars_rate: data.usd_ars_rate,
        cbus: data.cbus,
        alias: Array.isArray(data.cbus) && data.cbus.length > 0 ? data.cbus[0].alias : '',
        cbu: Array.isArray(data.cbus) && data.cbus.length > 0 ? data.cbus[0].cbu : '',
        pickup_address: data.pickup_address,
        free_shipping_threshold_retailer: data.free_shipping_threshold_retailer,
        free_shipping_threshold_wholesaler: data.free_shipping_threshold_wholesaler,
        purchase_notify_emails: data.purchase_notify_emails.map(item => item.email),
        popup: data.popup,
      };

      const response = await api.put(putConfigRoute(), payload);
      if (response.data && response.data.status === true) {
        setSaveSuccess(true);
      } else {
        setError('No se pudo guardar la configuración');
      }
    } catch (err) {
      console.error('Error saving general config:', err);
      setError('Error al guardar la configuración');
    } finally {
      setSaveLoadingGeneral(false);
    }
  };

  const tabs = [
    { label: 'General', content: <GeneralTab control={control} errors={errors} cbusFields={cbusFields} appendCbu={appendCbu} removeCbu={removeCbu} emailFields={fields} appendEmail={append} removeEmail={remove} onSaveGeneral={onSaveGeneral} saveLoading={saveLoadingGeneral} /> },
    { label: 'Pop-up', content: <PopupTab control={control} watch={watch} setValue={setValue} getValues={getValues} /> },
  ];

  return (
    <Box maxWidth={800} mx="auto" mt={2}>
      <Typography variant="h5" fontWeight={600} mb={2}>Configuración del Negocio</Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>Configuración guardada exitosamente</Alert>
      )}

      {!loading && (
        <Box>
          <SimpleTabs tabs={tabs} />
        </Box>
      )}
    </Box>
  );
}
