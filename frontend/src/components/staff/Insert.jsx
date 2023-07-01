import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Input from '../wrappers/Input';
import Button from '../wrappers/Button';

/**
 * Staff view for all unfulfilled requests. Contains modal as well (TODO)
 * @param {onInsert} Function: Callback to trigger refresh of other components. See Inventory
 * @returns {JSX.Element} RequestList
 */
export default function Insert({ onInsert }) {
  const [formData, setFormData] = useState({
    itemName: '',
    itemCount: '',
    category: 'Foodstuff',
  });

  const clearFields = () => {
    setFormData({
      itemName: '',
      itemCount: 0,
      category: formData.category,
    });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOnClick = async (e) => {
    e.preventDefault();
    if (
      formData.itemName === '' ||
      formData.itemCount === '' ||
      formData.category === ''
    ) {
      // alert("Please fill all fields!");
    }

    try {
      await fetch('/api/insert_item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      }).catch(() => {});
      onInsert();
      clearFields();
    } catch (err) {
      // console.log(err);
    }
  };

  return (
    <div className="flex flex-col w-[30rem] h-[fit-content] items-center p-5 border border-black rounded-md bg-gray-100">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold">Insert an Item</h1>
        <Input label="Item Name">
          <input
            type="text"
            name="itemName"
            placeholder="Item Name"
            className="border-2 border-black rounded-md p-2 m-2"
            value={formData.itemName}
            onChange={handleInputChange}
          />
        </Input>
        <Input label="Item Count">
          <input
            type="number"
            name="itemCount"
            placeholder="Item Count"
            className="border-2 border-black rounded-md p-2 m-2"
            value={formData.itemCount}
            onChange={handleInputChange}
          />
        </Input>
        <Input label="Category">
          <select
            name="category"
            className="border-2 border-black rounded-md p-2 m-2"
            value={formData.category}
            onChange={handleInputChange}
          >
            <option value="Foodstuff">Foodstuff</option>
            <option value="PersonalCareProduct">Personal Care Product</option>
          </select>
        </Input>
      </div>

      <Button onClick={handleOnClick} linkTo="#">
        Insert Item
      </Button>
    </div>
  );
}

Insert.propTypes = {
  onInsert: PropTypes.func,
};

Insert.defaultProps = {
  onInsert: undefined,
};
