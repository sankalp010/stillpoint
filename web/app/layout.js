import './globals.css';
import { ThemeProvider } from '../components/ThemeProvider';
import Script from 'next/script';

const themeBootstrapScript = `try{var t=localStorage.getItem('stillpoint-theme');document.documentElement.dataset.theme=t==='dark'||t==='light'?t:'light'}catch(e){document.documentElement.dataset.theme='light'}`;

export const metadata = {
  title: 'Stillpoint — Mock Coding Interviews',
  description: 'A calmer way to practice coding interviews.',
};

export default function RootLayout({ children }) {
  return <html lang="en" data-theme="light" suppressHydrationWarning>
    <head><Script id="stillpoint-theme-bootstrap" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} /></head>
    <body><ThemeProvider>{children}</ThemeProvider></body>
  </html>;
}
