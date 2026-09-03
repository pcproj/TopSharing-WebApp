import Link from 'next/link';

export default function UserNotFound() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '70vh',
      textAlign: 'center',
      fontFamily: 'sans-serif'
    }}>
      <h2 style={{ fontSize: '32px', marginBottom: '10px', color: '#ff4a4a' }}>
        📺 Canal Não Encontrado
      </h2>
      <p style={{ color: '#666', marginBottom: '20px', fontSize: '18px' }}>
        O utilizador que está a tentar assistir não existe ou desativou a transmissão.
      </p>
      
      <Link 
        href="/" 
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#0070f3', 
          color: '#fff', 
          borderRadius: '5px', 
          textDecoration: 'none',
          fontWeight: 'bold'
        }}
      >
        Voltar à Página Inicial
      </Link>
    </div>
  );
}
