import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import type { ButtonHTMLAttributes } from "react";
import type { HTMLAttributes } from "react";

type DivMotionProps = HTMLMotionProps<"div"> & HTMLAttributes<HTMLDivElement>;
type ButtonMotionProps = HTMLMotionProps<"button"> & ButtonHTMLAttributes<HTMLButtonElement>;

export default function ButtonMotion({ children, ...props }: ButtonMotionProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function DivMotion ({children, ...props }: DivMotionProps){
  return (
    <motion.div 
    animate={{ 
      scale: [1, 2, 2, 1, 1],
    }} 
    transition={{
      duration: 1.25,
    }}
    {...props}
    >
      {children}
    </motion.div>
  )
}




