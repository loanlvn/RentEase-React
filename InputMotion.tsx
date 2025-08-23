import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type InputMotionProps = HTMLMotionProps<"input"> & InputHTMLAttributes<HTMLInputElement>;
type TextaeraMotionProps = HTMLMotionProps<"textarea"> & TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function InputMotion({ children, ...props }: InputMotionProps) {
  return (
    <motion.input
      whileFocus={{ scale: 1.05 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
      className="w-full pr-12 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      {children}
      
    </motion.input>
  );
}

export function TextareaMotion({children, ...props}: TextaeraMotionProps){
  return (
    <motion.textarea
      whileFocus={{ scale: 1.05 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
      className="w-full px-4 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      {children}
    </motion.textarea>
  )

}
