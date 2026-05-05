// PickupMap: mapa Google Maps embed da loja física, exibido em
// /pedido-confirmado quando is_pickup === true. Usa o endpoint
// `?q={address}&output=embed` em vez do `embed?pb=` token-based,
// porque o address vem dinamicamente de settings.pickup_address (admin
// pode editar) e o formato com query-param respeita esse valor sem
// precisar regenerar token. Não requer Google Maps API key.

interface PickupMapProps {
  address: string;
}

export function PickupMap({ address }: PickupMapProps) {
  const url = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  return (
    <div style={{ width: '100%', marginTop: 16, marginBottom: 16 }}>
      <iframe
        src={url}
        title={`Mapa: ${address}`}
        aria-label={`Localização da loja para retirada: ${address}`}
        width="100%"
        height="280"
        style={{ border: 0, display: 'block' }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
