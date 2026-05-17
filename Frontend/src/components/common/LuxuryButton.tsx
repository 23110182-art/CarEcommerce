import { Button, type ButtonProps } from 'antd';
import { motion, type HTMLMotionProps } from 'framer-motion';

type LuxuryButtonProps = ButtonProps & {
  motionProps?: HTMLMotionProps<"div">;
};

export const LuxuryButton = ({ children, motionProps, ...props }: LuxuryButtonProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      style={{ display: 'inline-block' }}
      {...motionProps}
    >
      <Button 
        type="primary" 
        size="large"
        {...props}
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          padding: '0 32px',
          ...props.style
        }}
      >
        {children}
      </Button>
    </motion.div>
  );
};
