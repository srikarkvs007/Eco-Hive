import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
    title = 'Eco-Hive | Premium Sustainable Shopping', 
    description = 'Discover eco-friendly tech, apparel, and home goods. Experience world-class sustainable e-commerce with Eco-Hive.', 
    name = 'Eco-Hive', 
    type = 'website',
    image = 'https://via.placeholder.com/1200x630?text=Eco-Hive'
}) => {
    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{title}</title>
            <meta name='description' content={description} />
            
            {/* Facebook / OpenGraph tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            
            {/* Twitter tags */}
            <meta name="twitter:creator" content={name} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
        </Helmet>
    );
}

export default SEO;
