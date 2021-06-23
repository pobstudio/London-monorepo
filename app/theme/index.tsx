import { createGlobalStyle } from 'styled-components';
export const ThemedGlobalStyle = createGlobalStyle`
    body, html, * {
        box-sizing: border-box;
        font-family: "Computer Modern Serif", 'Times New Roman', Times, serif;
    }
    html {
    }
    body {
        background: white;
        min-height: 100vh;
        width: 100%;
        margin: 0;
    }
`;
