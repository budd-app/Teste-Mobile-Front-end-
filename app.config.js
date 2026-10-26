// Estende o app.json com configuração que depende de variáveis de ambiente.
// A chave do Google Maps nunca é commitada: vem de GOOGLE_MAPS_API_KEY no build
// (ex.: `eas env:create` ou variável local). Sem ela, o Mapa mostra um aviso
// em vez de derrubar o app no Android.
const mapsKey = process.env.GOOGLE_MAPS_API_KEY;

module.exports = ({ config }) => ({
  ...config,
  plugins: [...(config.plugins ?? []), ...(mapsKey ? [['react-native-maps', { androidGoogleMapsApiKey: mapsKey }]] : [])],
  extra: { ...config.extra, hasGoogleMapsKey: Boolean(mapsKey) },
});
