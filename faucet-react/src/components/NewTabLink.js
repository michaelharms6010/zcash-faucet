import React from 'react';

export default function NewTabLink({href, children}) {
    return(
        <a  
            href={href} 
            rel="noopener noreferrer" 
            target="_blank">
            {children}
        </a>
    )

}