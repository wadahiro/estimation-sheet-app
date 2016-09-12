import * as React from 'react';
import * as M from 'react-mdl';

import { Option } from '../reducers';

const { Combobox } = require('react-input-enhancements');

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

    render() {
        const { value, options } = this.props;

        return (

            <Combobox
                defaultValue={value}
                options={options}
                dropdownProps={{ style: { width: '100%' } }}
                onValueChange={this.handleValueChange}
                onChange={this.handleChange}
                autocomplete>
                {inputProps => {
                    return <M.Textfield
                        {...inputProps}
                        className='select-item'
                        label=''
                        style={{ width: '100%' }}
                        placeholder='商品を選択してください'
                        expandableIcon='search'
                        />
                } }
            </Combobox>
        );
    }

}