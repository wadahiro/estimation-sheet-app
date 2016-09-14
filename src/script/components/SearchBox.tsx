import * as React from 'react';

import TextField from 'material-ui/TextField';

import { Option } from '../reducers';

const { Combobox, Dropdown  } = require('react-input-enhancements');
const filters = require('react-input-enhancements/lib/filters');

const optionFilters = [
    filters.filterByMatchingTextWithThreshold(20),
    filters.sortByMatchingText,
    filters.limitBy(10000),
    filters.notFoundMessage('見つかりません'),
    filters.filterRedudantSeparators
];

interface Props {
    value: string;
    options: Option[];
    onValueChange: (id: string) => void;
    onChangeSearchWord: (word: string) => void;
}

export class SearchBox extends React.Component<Props, void> {
    handleChange = (e) => {
        this.props.onChangeSearchWord(e.target.value);
    };

    handleValueChange = (id: string) => {
        setTimeout(() => {
            this.props.onValueChange(id);
        });
    };

    renderOption = (className, style, opt: Option, highlighted) => {
        const customStyle = style || {};
        if (!opt.onSale) {
            customStyle.fontStyle = 'italic';
            customStyle.color = 'rgba(0, 0, 0, 0.298039)';
        }
        return Dropdown.defaultProps.onRenderOption(className, customStyle, opt, highlighted);
    };

    render() {
        const { value, options } = this.props;

        return (

            <Combobox
                defaultValue={value}
                options={options}
                dropdownProps={{ style: { width: '100%' } }}
                onValueChange={this.handleValueChange}
                onChange={this.handleChange}
                onRenderOption={this.renderOption}
                optionFilters={optionFilters}
                autocomplete>
                {inputProps => {
                    return <TextField
                        {...inputProps}
                        className='select-item'
                        style={{ width: '100%' }}
                        hintText='商品を選択してください'
                        />
                } }
            </Combobox>
        );
    }

}