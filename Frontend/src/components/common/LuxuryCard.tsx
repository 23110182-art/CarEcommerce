import { Card, type CardProps } from 'antd';
import { motion } from 'framer-motion';

type LuxuryCardProps = CardProps & {
  imageSrc: string;
  title: string;
  subtitle: string;
  price: string;
};

export const LuxuryCard = ({ imageSrc, title, subtitle, price, ...props }: LuxuryCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Card
        hoverable
        cover={
          <div style={{ overflow: 'hidden', height: '250px' }}>
            <motion.img 
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.5 }}
              alt={title} 
              src={imageSrc} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
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
          <div style={{ color: 'var(--color-accent)', fontSize: '22px', fontWeight: 'bold' }}>{price}</div>
        </div>
      </Card>
    </motion.div>
  );
};
