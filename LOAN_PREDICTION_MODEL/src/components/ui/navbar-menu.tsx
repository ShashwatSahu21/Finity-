"use client";
import React, { useState, useEffect, useCallback, ReactNode } from "react";
import { motion } from "motion/react";
import { Link, LinkProps, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { supabase } from "../../lib/supabase";
import LanguageSelector from "../LanguageSelector";
import TranslatedText from "./TranslatedText";

const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const MenuItem = ({
  setActive,
  active,
  item,
  children,
  isItemActive,
}: {
  setActive: (item: string | null) => void;
  active: string | null;
  item: string;
  children?: React.ReactNode;
  isItemActive?: boolean;
}) => {
  return (
    <div onMouseEnter={() => setActive(item)} className="relative">
      <motion.p
        transition={{ duration: 0.3 }}
        className={`cursor-pointer text-white hover:opacity-[0.9] relative ${
          isItemActive ? 'after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[2px] after:bg-blue-500' : ''
        }`}
      >
        <TranslatedText text={item} />
      </motion.p>
      {active !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
        >
          {active === item && (
            <div className="absolute top-[calc(100%_+_1.2rem)] left-1/2 transform -translate-x-1/2 pt-4">
              <motion.div
                transition={transition}
                layoutId="active"
                className="bg-neutral-900 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/[0.2] shadow-xl"
              >
                <motion.div
                  layout
                  className="w-max h-full p-4"
                >
                  {children}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const Menu = ({
  setActive,
  children,
}: {
  setActive: (item: string | null) => void;
  children: ReactNode;
}) => {
  return (
    <nav
      onMouseLeave={() => setActive(null)}
      className="relative rounded-full border border-white/[0.2] bg-neutral-900/80 shadow-input flex justify-center px-8 py-3"
    >
      <div className="flex items-center">
        <div className="flex items-center space-x-6">
          {children}
        </div>
        <div className="border-l border-white/[0.2] h-6 mx-4" />
        <div className="flex items-center space-x-3">
          <LanguageSelector />
          <button
            onClick={() => supabase.auth.signOut()}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-neutral-800 text-red-500 hover:bg-neutral-700 transition-colors"
          >
            <TranslatedText text="Logout" />
          </button>
        </div>
      </div>
    </nav>
  );
};

interface HoveredLinkProps extends LinkProps {
  children: React.ReactNode;
}

export const HoveredLink: React.FC<HoveredLinkProps> = ({ children, to, ...rest }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      {...rest}
      className={`text-neutral-200 hover:text-white transition-colors relative ${
        isActive ? 'text-white after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[2px] after:bg-blue-500' : ''
      }`}
    >
      <TranslatedText text={children as string} />
    </Link>
  );
};

interface NavButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export const NavButton: React.FC<NavButtonProps> = ({ onClick, children, className }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
        "bg-red-600 text-white hover:bg-red-700",
        className
      )}
    >
      <TranslatedText text={children as string} />
    </button>
  );
};

export const ProductItem = ({
  title,
  description,
  href,
  src,
}: {
  title: string;
  description: string;
  href: string;
  src: string;
}) => {
  return (
    <Link to={href} className="flex space-x-2">
      <img
        src={src}
        width={140}
        height={70}
        alt={title}
        className="shrink-0 rounded-md shadow-2xl"
      />
      <div>
        <h4 className="text-xl font-bold mb-1 text-white">
          {title}
        </h4>
        <p className="text-neutral-300 text-sm max-w-[10rem]">
          {description}
        </p>
      </div>
    </Link>
  );
}; 