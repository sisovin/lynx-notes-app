import * as React from 'react';

// Define the Lynx input event type
type LynxInputEvent = string;

// Define Lynx-specific attribute interfaces
interface LynxInputAttributes {
  type?: string;
  name?: string;
  value?: string;
  bindchange?: (value: LynxInputEvent) => void;
  placeholder?: string;
  className?: string;
  multiline?: string;
  rows?: string;
}

interface LynxButtonAttributes {
  type?: 'submit' | 'button' | 'reset';
  bindtap?: (event?: any) => void;
  className?: string;
}

interface LynxViewAttributes {
  className?: string;
  key?: string | number;
}

interface LynxTextAttributes {
  className?: string;
}

interface LynxPageAttributes {
  className?: string;
}

// Define the component types
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'input': LynxInputAttributes;
      'button': LynxButtonAttributes;
      'view': LynxViewAttributes;
      'text': LynxTextAttributes;
      'page': LynxPageAttributes;
    }
  }
}

// Export our custom type
export type { LynxInputEvent };