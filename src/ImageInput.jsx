import React from 'react';
import PropTypes from 'prop-types';

import './ImageInput.css';

const DEFAULT_SIZE = 150;
const EMPTY_OBJECT = {};

/**
 * Resizes an image to the specified size
 * @param {string} imgSrc The content of the image
 * @param {number} maxWidth Maxium width of the resize image
 * @param {number} maxHeight Maximun height of the resize image
 */
const resizeImage = (imgSrc, maxWidth, maxHeight) => {
    return new Promise((resolve, reject) => {
        const image = document.createElement('img');

        image.onload = () => {
            const canvas = document.createElement('canvas');
            
            if (image.width <= maxWidth && image.height <= maxHeight) {
                resolve(imgSrc);
            }

            if (image.width > image.height) {
                if (image.width > maxWidth) {
                    image.height *= maxWidth / image.width;
                    image.width = maxWidth;
                }
            } else if (image.height > maxHeight) {
                image.width *= maxHeight / image.height;
                image.height = maxHeight;
            }
    
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0, image.width, image.height);
            
            const data = canvas.toDataURL();

            if (data) {
                resolve(data);
            } else {
                reject(new Error());
            }
        };
        
        image.src = imgSrc;
    });
};

class ImageInput extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            image: props.defaultValue
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleClearClick = this.handleClearClick.bind(this);
        this.saveRef = this.saveRef.bind(this);

        if (this.props.maxSize) {
            this.size = {
                width: this.props.maxSize.width,
                height: this.props.maxSize.height
            };
        } else {
            this.size = {
                width: DEFAULT_SIZE,
                height: DEFAULT_SIZE
            };
        }
    }

    static getDerivedStateFromProps(props, state) {
        if (props.value && state !== props.value) {
            return {
                image: props.value
            };
        }

        return null;
    }

    handleChange() {
        const file = this.fileInput.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const image = e.target.result;

            if (this.props.maxSize) {
                resizeImage(image, this.props.maxSize.width, this.props.maxSize.height).then((newImage) => {
                    this.updateImage(newImage);
                });
            } else {
                this.updateImage(image);
            }
        };

        if (file) {
            reader.readAsDataURL(file);
        }
    }

    handleClearClick() {
        this.fileInput.value = '';
        this.setState({
            image: ''
        });
        if (this.props.onChange) {
            this.props.onChange('');
        }
    }

    saveRef(input) {
        this.fileInput = input;
    }

    updateImage(image) {
        this.setState({
            image
        }, () => {
            if (this.props.onChange) {
                this.props.onChange(image);
            }
        });
    }

    render() {
        return (
            <div className='amber-image-input'>
                <label>
                    {
                        (this.props.placeholder && !this.state.image) ?
                            <div className='default-content' style={ this.size }>{ this.props.placeholder }</div> :
                            <img 
                                alt={this.props.description} 
                                src={this.state.image}
                                style={this.state.image ? EMPTY_OBJECT : this.size }
                                title={this.props.title} />
                    }
                    <input
                        accept='image/*'
                        disabled={this.props.disabled}
                        ref={this.saveRef}
                        type='file'
                        onChange={this.handleChange} />    
                </label>
                <div className='clear' onClick={this.handleClearClick} title='Remove image'>X</div>
            </div>
        );
    }
}

ImageInput.propTypes = {
    /** Optional (alt) attribute to be used in a SimpleFormItem */
    description: PropTypes.string,
    /** Default image to be loaded */
    defaultValue: PropTypes.string,
    disabled: PropTypes.bool,
    /** Max size of the selected image. The image will be resized if exedes the dimensions */
    maxSize: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }),
    /** Optional default content to be displayed when there is no value */
    placeholder: PropTypes.node,
    /** Callback for the onchange event */
    onChange: PropTypes.func,
    /** Title attribute for the image */
    title: PropTypes.string,
    value: PropTypes.string,
};

export default ImageInput;
