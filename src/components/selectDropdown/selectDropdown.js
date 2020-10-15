import React from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated";

const animatedComponents = makeAnimated();

function SelectDropdown({
  onChange,
  options,
  placeholder,
  // value,
  isLoading = false,
  defaultValue = [],
}) {
  /**
   * @param {function} onChange: Takes in Array(Objects) of selected objects, null if nothing is selected
   * @param {Object} Options: Select Options. Should contain a "value" and "label" key
   * @param {Array} defaultValue: The list of default options
   * @param {string} placeholder: Hint text when there is nothing selected
   */
  return (
    <Select
      closeMenuOnSelect={false}
      components={animatedComponents}
      defaultValue={defaultValue}
      // value={value}
      isMulti
      isSearchable
      isClearable
      isLoading={isLoading}
      placeholder={placeholder}
      onChange={onChange}
      options={options}
    />
  );
}
export default SelectDropdown;
