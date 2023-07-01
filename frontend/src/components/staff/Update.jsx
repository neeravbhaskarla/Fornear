import { Checkbox, Table, notification } from 'antd';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Input from '../wrappers/Input';

/**
 * Update inventory items individually or in bulk
 * @param {refresh} Boolean: Trigger refresh of data
 * @param {onRefresh} Function: Callback to trigger refresh of other components. See Inventory
 * @returns {JSX.Element} Update
 */
export default function Update({ refresh, onRefresh }) {
  const [loading, setLoading] = useState(true);
  const [inventoryData, setInventoryData] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewData, setViewData] = useState([]);
  const [api, contextHolder] = notification.useNotification();

  const [formData, setFormData] = useState({
    auditor: '',
  });

  const handleFormInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Update selectedItems with the selected item's associated quantity (TODO: util)
  const handleItemCountChange = (itemName, newQuantity) => {
    const newSelectedItems = selectedItems.map((item) => {
      if (item.itemName === itemName) {
        return {
          ...item,
          itemCount: newQuantity,
        };
      }
      return item;
    });
    setSelectedItems(newSelectedItems);
  };

  // Return whether itemName is already in selectedItems (TODO: util)
  const isInSelectedItems = (itemName) =>
    selectedItems.some((item) => item.itemName === itemName);

  const handleCheckboxChange = (itemName, checked) => {
    // Item cannot be deselected if it is not in selectedItems
    if (!isInSelectedItems(itemName) && !checked) {
      return;
    }
    if (checked) {
      // Create new item object to format selectedItems entry
      const newItem = {
        itemName,
        itemCount:
          parseInt(
            inventoryData.find((item) => item.itemName === itemName).itemCount,
            10,
          ) || 0,
      };
      setSelectedItems((prevSelectedItems) => [...prevSelectedItems, newItem]);
      // Update viewData to show checkbox as checked for selected item
      setViewData((prevViewData) => {
        const updatedViewData = prevViewData.map((item) => {
          if (item.itemName === itemName) {
            return {
              ...item,
              checkbox: <Checkbox key={item._id} checked={true} />,
            };
          }
          return item;
        });
        return updatedViewData;
      });
    } else {
      // Keep items in selectedItems whose itemName attribute is not itemName
      setSelectedItems((prevSelectedItems) =>
        prevSelectedItems.filter((item) => item.itemName !== itemName),
      );
      // Update viewData to show checkbox as unchecked for deselected item
      setViewData((prevViewData) => {
        const updatedViewData = prevViewData.map((item) => {
          if (item.itemName === itemName) {
            return {
              ...item,
              checkbox: <Checkbox key={item._id} checked={false} />,
            };
          }
          return item;
        });
        return updatedViewData;
      });
    }
  };

  // TODO (util)
  const inventoryListWithCheckbox = inventoryData.map((item) => ({
    ...item,
    checkbox: (
      <Checkbox
        key={item._id}
        checked={isInSelectedItems(item.itemName)}
        onChange={(e) => handleCheckboxChange(item.itemName, e.target.checked)}
      />
    ),
  }));
  const handleSearchChange = (e) => {
    const { value } = e.target;
    // Filter inventoryListWithCheckbox to show items whose name includes the searchbox contents
    const filteredData = inventoryListWithCheckbox.filter((item) =>
      item.itemName.toLowerCase().includes(value.toLowerCase()),
    );
    setViewData(filteredData);
  };

  useEffect(() => {
    fetch('/api/get_inventory')
      .then((res) => res.json())
      .then((data) => {
        // Add key to data for antd table
        const dataWithKey = data.map((item, index) => ({
          ...item,
          key: index,
        }));
        setInventoryData(dataWithKey);
        setLoading(false);
      });
    // eslint-disable-next-line no-sparse-arrays
  }, [, refresh, onRefresh]);

  // Update viewData to show checkboxes when inventoryData changes
  useEffect(() => {
    setViewData(inventoryListWithCheckbox);
  }, [inventoryData]);

  const columns = [
    {
      title: 'Item',
      dataIndex: 'itemName',
      key: 'itemName',
      sorter: (a, b) => a.itemName.localeCompare(b.itemName),
      filterSearch: true,
      onfilter: (value, record) => record.itemName.includes(value),
    },
    {
      title: 'Quantity',
      dataIndex: 'itemCount',
      key: 'itemCount',
      sorter: (a, b) => a.itemCount - b.itemCount,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: [
        {
          text: 'Foodstuff',
          value: 'Foodstuff',
        },
        {
          text: 'Personal Care Product',
          value: 'PersonalCareProduct',
        },
      ],
      onFilter: (value, record) => record.category.includes(value),
    },
    {
      title: 'Select',
      dataIndex: 'checkbox',
      key: 'checkbox',
    },
  ];

  const getMaxPackages = () =>
    Math.min(
      ...selectedItems.map((item) => {
        const inventoryItem = inventoryData.find(
          (invItem) => invItem.itemName === item.itemName,
        );
        return Math.floor(inventoryItem.itemCount / item.itemCount);
      }),
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.packageName === '' || formData.author === '') {
      api.open({
        message: 'Error',
        description:
          'Please fill in all the fields before submitting the form.',
      });
      return;
    }
    const postData = {
      ...formData,
      selectedItems,
      quantityAvailable: getMaxPackages(),
    };
    try {
      await fetch('/api/update_inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
      // console.log(postData);
      onRefresh();
    } catch (err) {
      // console.log(err);
    }
  };

  return (
    <>
      {contextHolder}
      <h1 className="text-3xl font-bold">Update Tool</h1>
      <div className="flex flex-row w-[fit-content] h-[40rem] px-10 border border-black rounded-md gap-x-10 items-center justify-center bg-gray-100">
        <div>
          <Input label="Auditor">
            <input
              type="text"
              name="auditor"
              onChange={handleFormInputChange}
            />
          </Input>
          <Input>
            <input
              type="text"
              className="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              name="search"
              onChange={handleSearchChange}
              placeholder="Search for an item"
            />
          </Input>
          <Table
            className="table table-striped w-[50rem] h-[30rem] overflow-y-scroll"
            dataSource={viewData}
            columns={columns}
            loading={loading}
            // On antd table rowClick
            onRow={(record) => ({
              onClick: () => {
                handleCheckboxChange(
                  record.itemName,
                  // Set checked to opposite of what current item is
                  !isInSelectedItems(record.itemName),
                );
              },
            })}
            // TODO: Determine pageSizeOptions
            pagination={{
              defaultPageSize: 5,
              showSizeChanger: true,
              pageSizeOptions: ['5', '10', '25', '50', '100'],
            }}
          />
        </div>
        <div>
          <div>
            {selectedItems.map((item) => (
              <Input
                key={item.itemName + Math.floor(Math.random() * 100)}
                label={item.itemName}
              >
                <input
                  type="number"
                  name="quantity"
                  value={item.itemCount}
                  onChange={(e) => {
                    if (e.target.value < 0) {
                      return;
                    }
                    handleItemCountChange(item.itemName, e.target.value);
                  }}
                />
              </Input>
            ))}
          </div>
          {selectedItems.length > 0 && (
            <p className="text-xl">
              You are editing <b>{selectedItems.length}</b>
              {selectedItems.length > 1 ? ' fields.' : ' field.'}
              {/* 
              TODO: Calculate the number of actual items changed.
              i.e. if inventory reports:
                30 cans and 20 jars,
                cans input becomes  28 and jars input becomes 22,
                display "with 4 changes"
              */}
              {/* , with{' '}
            <b>
              {selectedItems.reduce(
                (acc, item) => acc + parseInt(item.itemCount, 10),
                0,
              )}
              </b>{' '}
            changes. */}
            </p>
          )}
          <Input label="Comments">
            <textarea
              type="text"
              name="comments"
              onChange={handleFormInputChange}
            />
          </Input>
          {selectedItems.length > 0 && (
            <button
              type="button"
              className="bg-primary hover:bg-accent-blue text-black font-bold py-2 px-4 rounded align-center"
              onClick={handleSubmit}
            >
              Update{' '}
              {selectedItems.length > 1
                ? `${selectedItems.length} items`
                : selectedItems[0].itemName}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

Update.propTypes = {
  refresh: PropTypes.bool,
  onRefresh: PropTypes.func,
};

Update.defaultProps = {
  refresh: false,
  onRefresh: undefined,
};
