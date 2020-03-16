import React from 'react';

class ReferenceElement extends React.Component {
    render() {
        return (
            <a target="_blank" rel="noopener noreferrer" href={"https://wormbase.org/resources/paper/" + this.props.element.wb_id}>{this.props.element.title}</a>
        );
    }
}

export default ReferenceElement;