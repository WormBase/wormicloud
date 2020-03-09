import React from 'react';

class ReferenceElement extends React.Component {
    render() {
        return (
            <a href={"https://wormbase.org/resources/paper/" + this.props.element}>{this.props.element}</a>
        );
    }
}

export default ReferenceElement;