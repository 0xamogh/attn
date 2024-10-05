const { default: daisyui } = require('daisyui');

module.exports = {
        content: ['./app/**/*.{js,ts,jsx,tsx,mdx}'],
        plugins: [
        require('daisyui'),
      ],
      theme: {
        extend: {
          colors: {
            'cream' : '#fff6ea'
          }
        }
      },
      daisyui : {
        themes: [
          {mytheme : {
            "primary" : "#ff5757",
            "background":  '#fff6ea',
            "neutral":"#38b6ff",
          }
        }
        ]
      }  
  };