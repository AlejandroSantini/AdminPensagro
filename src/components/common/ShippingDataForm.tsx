import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import AddIcon from '@mui/icons-material/Add';
import { Input } from './Input';
import { Select } from './Select';
import { OutlinedButton } from './OutlinedButton';
import api from '../../services/api';
import { getClientShippingAddressesRoute, postShippingAddressRoute } from '../../services/shipping';

interface ShippingAddress {
  id: number;
  client_id: number;
  first_name: string;
  last_name: string;
  address: string;
  apartment: string;
  city: string;
  province: string;
  postal_code: string;
  phone: string;
}

interface ShippingDataFormProps {
  clientId?: string | number | null;
  namePrefix?: string;
  initialAddressId?: number | null;
  onError?: (message: string) => void;
  onAddressChange?: (addressId: string | null) => void;
}

export function ShippingDataForm({ 
  clientId, 
  namePrefix = 'shippingData',
  initialAddressId,
  onError,
  onAddressChange
}: ShippingDataFormProps) {
  const { control, setValue, getValues } = useFormContext();
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(!clientId);

  useEffect(() => {
    if (clientId) {
      loadAddresses(clientId.toString());
    } else {
      setAddresses([]);
      setSelectedAddressId('');
      setShowNewAddressForm(true);
    }
  }, [clientId]);

  useEffect(() => {
    if (initialAddressId && addresses.length > 0) {
      const exists = addresses.find(a => a.id === initialAddressId);
      if (exists) {
        setSelectedAddressId(initialAddressId.toString());
        setShowNewAddressForm(false);
        onAddressChange?.(initialAddressId.toString());

        setValue(namePrefix, {
          first_name: exists.first_name || '',
          last_name: exists.last_name || '',
          address: exists.address || '',
          apartment: exists.apartment || '',
          city: exists.city || '',
          province: exists.province || '',
          postal_code: exists.postal_code || '',
          phone: exists.phone || ''
        });
      }
    }
  }, [initialAddressId, addresses]);

  const loadAddresses = async (id: string) => {
    setLoadingAddresses(true);
    try {
      const response = await api.get(getClientShippingAddressesRoute(id));
      if (response.data?.status === true) {
        setAddresses(response.data.data || []);
      } else {
        setAddresses([]);
      }
    } catch (err) {
      console.error("Error loading addresses:", err);
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    setShowNewAddressForm(addressId === 'new');
    onAddressChange?.(addressId === 'new' ? null : addressId);
    
    if (addressId === 'new') {
      setValue(namePrefix, {
        first_name: '',
        last_name: '',
        address: '',
        apartment: '',
        city: '',
        province: '',
        postal_code: '',
        phone: ''
      });
    } else {
      const selectedAddress = addresses.find(addr => addr.id.toString() === addressId);
      if (selectedAddress) {
        setValue(namePrefix, {
          first_name: selectedAddress.first_name || '',
          last_name: selectedAddress.last_name || '',
          address: selectedAddress.address || '',
          apartment: selectedAddress.apartment || '',
          city: selectedAddress.city || '',
          province: selectedAddress.province || '',
          postal_code: selectedAddress.postal_code || '',
          phone: selectedAddress.phone || ''
        });
      }
    }
  };

  const handleCreateAddress = async () => {
    if (!clientId) return;
    
    const shippingData = getValues(namePrefix);
    if (!shippingData?.first_name || !shippingData?.address) {
      onError?.('Complete los campos obligatorios de la dirección');
      return;
    }

    try {
      const response = await api.post(postShippingAddressRoute(), {
        client_id: parseInt(clientId.toString()),
        first_name: shippingData.first_name,
        last_name: shippingData.last_name,
        address: shippingData.address,
        apartment: shippingData.apartment,
        city: shippingData.city,
        province: shippingData.province,
        postal_code: shippingData.postal_code,
        phone: shippingData.phone
      });

      if (response.data?.status === true) {
        await loadAddresses(clientId.toString());
        if (response.data.data?.id) {
          setSelectedAddressId(response.data.data.id.toString());
        }
        setShowNewAddressForm(false);
      }
    } catch (err) {
      console.error("Error creating address:", err);
      onError?.('Error al crear la dirección');
    }
  };

  return (
    <Box>
      {clientId && (
        <Box sx={{ mb: 2 }}>
          {loadingAddresses ? (
            <Box display="flex" justifyContent="center" py={2}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <>
              <Select
                label="Dirección de envío"
                value={selectedAddressId}
                onChange={(e) => handleAddressSelect(e.target.value as string)}
                options={[
                  ...addresses.map(addr => ({
                    label: `${addr.first_name} ${addr.last_name} - ${addr.address}, ${addr.city}`,
                    value: addr.id.toString()
                  })),
                  { label: '+ Agregar nueva dirección', value: 'new' }
                ]}
              />
              {selectedAddressId && selectedAddressId !== 'new' && (
                <Box sx={{ mt: 1, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  {(() => {
                    const addr = addresses.find(a => a.id.toString() === selectedAddressId);
                    if (!addr) return null;
                    return (
                      <Typography variant="body2" color="text.secondary">
                        <strong>{addr.first_name} {addr.last_name}</strong><br />
                        {addr.address}{addr.apartment ? `, ${addr.apartment}` : ''}<br />
                        {addr.city}, {addr.province} - CP: {addr.postal_code}<br />
                        Tel: {addr.phone}
                      </Typography>
                    );
                  })()}
                </Box>
              )}
            </>
          )}
        </Box>
      )}

      {(!clientId || showNewAddressForm || selectedAddressId === 'new') && (
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Controller
                name={`${namePrefix}.first_name`}
                control={control}
                render={({ field }) => (
                  <Input 
                    label="Nombre" 
                    {...field} 
                    variant="outlined"
                  />
                )}
              />

              <Controller
                name={`${namePrefix}.last_name`}
                control={control}
                render={({ field }) => (
                  <Input 
                    label="Apellido" 
                    {...field} 
                    variant="outlined"
                  />
                )}
              />
            </Box>

            <Controller
              name={`${namePrefix}.phone`}
              control={control}
              render={({ field }) => (
                <Input 
                  label="Teléfono" 
                  {...field} 
                  variant="outlined"
                  placeholder="+54 9 11 1234-5678"
                />
              )}
            />

            <Controller
              name={`${namePrefix}.address`}
              control={control}
              render={({ field }) => (
                <Input 
                  label="Dirección" 
                  {...field} 
                  variant="outlined"
                  placeholder="Ej: Av. Corrientes 1234"
                />
              )}
            />

            <Controller
              name={`${namePrefix}.apartment`}
              control={control}
              render={({ field }) => (
                <Input 
                  label="Piso / Departamento" 
                  {...field} 
                  variant="outlined"
                  placeholder="Ej: Piso 3, Depto B"
                />
              )}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
              <Controller
                name={`${namePrefix}.city`}
                control={control}
                render={({ field }) => (
                  <Input 
                    label="Ciudad" 
                    {...field} 
                    variant="outlined"
                  />
                )}
              />

              <Controller
                name={`${namePrefix}.province`}
                control={control}
                render={({ field }) => (
                  <Input 
                    label="Provincia" 
                    {...field} 
                    variant="outlined"
                  />
                )}
              />

              <Controller
                name={`${namePrefix}.postal_code`}
                control={control}
                render={({ field }) => (
                  <Input 
                    label="Código Postal" 
                    {...field} 
                    variant="outlined"
                  />
                )}
              />
            </Box>
          </Box>

          {clientId && selectedAddressId === 'new' && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <OutlinedButton 
                onClick={handleCreateAddress}
                startIcon={<AddIcon />}
              >
                Guardar dirección
              </OutlinedButton>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
