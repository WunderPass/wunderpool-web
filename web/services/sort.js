import React from 'react';

// Compare function needed by the Sort component
const compare =(a, b) => {

  }

const Sort= ({children, by})=> {
If (!by) {
return children
}
return React.Children.toArray(children).sort(compare)

}