declare namespace JSX {
  interface IntrinsicElements {
    page: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    view: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    image: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
    text: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    style: React.DetailedHTMLProps<React.StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>;
    div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
    // Add other Lynx elements if needed
  }
}

// If you need to specifically declare the style attribute type
interface CSSProperties extends React.CSSProperties {
  // Add any custom CSS properties if needed
  [key: string]: any;
}