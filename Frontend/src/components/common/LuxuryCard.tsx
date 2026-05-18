import { Card, type CardProps } from 'antd';
import { motion } from 'framer-motion';

type LuxuryCardProps = CardProps & {
  imageSrc: string;
  title: string;
  subtitle: string;
  price: string;
  originalPrice?: string;
  discountTag?: string;
};

export const LuxuryCard = ({ imageSrc, title, subtitle, price, originalPrice, discountTag, ...props }: LuxuryCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Card
        hoverable
        cover={
          <div style={{ overflow: 'hidden', height: '250px', position: 'relative' }}>
            <motion.img 
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.5 }}
              alt={title} 
              src={imageSrc} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {discountTag && (
              <div style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'linear-gradient(135deg, #d4af37, #aa7c11)',
                color: 'black',
                fontWeight: 'bold',
                fontSize: '12px',
                padding: '6px 12px',
                borderRadius: '20px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                zIndex: 2,
              }}>
                {discountTag}
              </div>
            )}
          </div>
        }
        bordered={false}
        style={{ 
          background: 'var(--color-surface)',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          ...props.style
        }}
        {...props}
      >
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', margin: '0 0 8px 0', color: 'var(--color-text-primary)' }}>{title}</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', margin: '0 0 16px 0' }}>{subtitle}</p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '8px' }}>
            {originalPrice && (
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '15px', textDecoration: 'line-through' }}>
                {originalPrice}
              </span>
            )}
            <span style={{ color: 'var(--color-accent)', fontSize: '22px', fontWeight: 'bold' }}>
              {price}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
