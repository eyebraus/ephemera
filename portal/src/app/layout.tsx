import { Metadata } from 'next';
import React from 'react';
import TitleBar from '../components/title-bar';

interface Props {
    children: React.ReactNode;
}

/**
 * Root layout of the Ephemera portal.
 * @param props properties
 * @returns Root layout
 */
const RootLayout: React.FC<Props> = (props: Props) => {
    const { children } = props;

    return (
        <html lang="en">
            <body>
                <TitleBar />
                {children}
            </body>
        </html>
    );
};

export default RootLayout;

export const metadata: Metadata = {
    description: 'Build your world for your tabletop RPG',
    title: 'Ephemera',
};
