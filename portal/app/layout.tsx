import React from 'react';
import './global.css';

interface Props {
    children: React.ReactNode;
}

const RootLayout: React.FC<Props> = (props: Props) => {
    const { children } = props;

    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
};

export default RootLayout;

export const metadata = {
    description: 'Generated by create-nx-workspace',
    title: 'Welcome to portal',
};
