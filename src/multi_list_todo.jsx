import React, { useState, useEffect, useRef } from 'react';

export default function MultiListTodoApp() {
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState("");
  const isInitialLoad = useRef(true);

  // Test storage functionality
  const testStorage = () => {
    let testResult = "Storage test: ";
    
    // Test localStorage
    try {
      localStorage.setItem('test', 'localStorage-works');
      const localTest = localStorage.getItem('test');
      localStorage.removeItem('test');
      testResult += `localStorage: ${localTest === 'localStorage-works' ? 'OK' : 'FAIL'}, `;
    } catch (error) {
      testResult += `localStorage: ERROR (${error.message}), `;
    }
    
    // Test sessionStorage
    try {
      sessionStorage.setItem('test', 'sessionStorage-works');
      const sessionTest = sessionStorage.getItem('test');
      sessionStorage.removeItem('test');
      testResult += `sessionStorage: ${sessionTest === 'sessionStorage-works' ? 'OK' : 'FAIL'}`;
    } catch (error) {
      testResult += `sessionStorage: ERROR (${error.message})`;
    }
    
    console.log(testResult);
    return testResult;
  };

  // Load saved lists from storage when component mounts
  useEffect(() => {
    console.log("Component mounted - loading data...");
    testStorage();
    
    // Try to load data from localStorage
    const loadData = () => {
      try {
        const savedData = localStorage.getItem('todoLists');
        console.log("Raw saved data from localStorage:", savedData);
        
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          console.log("Parsed data:", parsedData);
          
          if (Array.isArray(parsedData)) {
            setLists(parsedData);
            console.log("Successfully loaded", parsedData.length, "lists from localStorage");
            return true;
          } else {
            console.log("Saved data is not an array:", typeof parsedData);
          }
        } else {
          console.log("No data found in localStorage");
        }
      } catch (error) {
        console.error("Error loading from localStorage:", error);
      }
      
      // If localStorage failed, try sessionStorage
      try {
        const sessionData = sessionStorage.getItem('todoLists');
        console.log("Raw saved data from sessionStorage:", sessionData);
        
        if (sessionData) {
          const parsedData = JSON.parse(sessionData);
          console.log("Parsed session data:", parsedData);
          
          if (Array.isArray(parsedData)) {
            setLists(parsedData);
            console.log("Successfully loaded", parsedData.length, "lists from sessionStorage");
            return true;
          } else {
            console.log("Session data is not an array:", typeof parsedData);
          }
        } else {
          console.log("No data found in sessionStorage");
        }
      } catch (error) {
        console.error("Error loading from sessionStorage:", error);
      }
      
      console.log("No valid data found in any storage");
      setLists([]);
      return false;
    };
    
    loadData();
    
    // Mark initial load as complete after a short delay
    setTimeout(() => {
      isInitialLoad.current = false;
      console.log("Initial load complete, saving enabled");
    }, 100);
  }, []);

  // Save lists to storage whenever lists change
  useEffect(() => {
    // Don't save during initial load
    if (isInitialLoad.current) {
      console.log("Skipping save during initial load");
      return;
    }
    
    console.log("Lists changed, saving to storage. Current lists:", lists);
    
    if (lists.length > 0) {
      const dataToSave = JSON.stringify(lists);
      console.log("Data to save:", dataToSave);
      
      // Try localStorage first
      try {
        localStorage.setItem('todoLists', dataToSave);
        console.log("Successfully saved to localStorage");
        
        // Verify the save worked
        const verifyData = localStorage.getItem('todoLists');
        console.log("Verification - data in localStorage:", verifyData);
        
      } catch (error) {
        console.error("localStorage save failed:", error);
        
        // Fallback to sessionStorage
        try {
          sessionStorage.setItem('todoLists', dataToSave);
          console.log("Successfully saved to sessionStorage");
        } catch (sessionError) {
          console.error("sessionStorage save failed:", sessionError);
        }
      }
    } else {
      // Clear storage if no lists
      console.log("No lists, clearing storage");
      try {
        localStorage.removeItem('todoLists');
        sessionStorage.removeItem('todoLists');
        console.log("Storage cleared");
      } catch (error) {
        console.error("Error clearing storage:", error);
      }
    }
  }, [lists]);

  const addList = () => {
    if (newListName.trim() !== "") {
      console.log("Adding list:", newListName);
      const newList = { name: newListName, items: [], newItem: "" };
      setLists(prevLists => [...prevLists, newList]);
      setNewListName("");
    }
  };

  const deleteList = (listIndex) => {
    console.log("Deleting list at index:", listIndex);
    setLists(prevLists => prevLists.filter((_, index) => index !== listIndex));
  };

  const addItem = (listIndex) => {
    if (lists[listIndex].newItem.trim() !== "") {
      console.log("Adding item to list", listIndex, ":", lists[listIndex].newItem);
      setLists(prevLists => {
        const updatedLists = [...prevLists];
        updatedLists[listIndex] = {
          ...updatedLists[listIndex],
          items: [...updatedLists[listIndex].items, {
            text: updatedLists[listIndex].newItem,
            completed: false
          }],
          newItem: ""
        };
        return updatedLists;
      });
    }
  };

  const deleteItem = (listIndex, itemIndex) => {
    console.log("Deleting item from list", listIndex, "at index", itemIndex);
    setLists(prevLists => {
      const updatedLists = [...prevLists];
      updatedLists[listIndex] = {
        ...updatedLists[listIndex],
        items: updatedLists[listIndex].items.filter((_, index) => index !== itemIndex)
      };
      return updatedLists;
    });
  };

  const updateNewItem = (listIndex, value) => {
    setLists(prevLists => {
      const updatedLists = [...prevLists];
      updatedLists[listIndex] = {
        ...updatedLists[listIndex],
        newItem: value
      };
      return updatedLists;
    });
  };

  const toggleItemCompletion = (listIndex, itemIndex) => {
    console.log("Toggling completion for list", listIndex, "item", itemIndex);
    setLists(prevLists => {
      const updatedLists = [...prevLists];
      updatedLists[listIndex] = {
        ...updatedLists[listIndex],
        items: updatedLists[listIndex].items.map((item, index) => 
          index === itemIndex 
            ? { ...item, completed: !item.completed }
            : item
        )
      };
      return updatedLists;
    });
  };

  return (
    <div 
      className="todo-container"
      style={{ 
        padding: '20px', 
        maxWidth: '1400px', 
        margin: '0 auto',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh'
      }}
    >
      <div 
        className="add-list-container"
        style={{ 
          display: 'flex', 
          gap: '12px', 
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}
      >
        <input
          type="text"
          placeholder="New list name"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addList()}
          className="add-list-input"
          style={{
            padding: '12px 16px',
            border: '2px solid #e9ecef',
            borderRadius: '12px',
            flex: '1',
            fontSize: '16px',
            backgroundColor: 'white',
            outline: 'none',
            transition: 'border-color 0.2s ease',
            minWidth: '200px'
          }}
          onFocus={(e) => e.target.style.borderColor = '#007bff'}
          onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
        />
        <button 
          onClick={addList}
          className="add-list-button"
          style={{
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#0056b3';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(0, 123, 255, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#007bff';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.3)';
          }}
        >
          Add List
        </button>
      </div>

      <div 
        className="todo-grid"
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '20px'
        }}
      >
        {lists.map((list, listIndex) => (
          <div 
            key={listIndex} 
            className="todo-card"
            style={{
              border: 'none',
              borderRadius: '16px',
              padding: '20px',
              backgroundColor: 'white',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
              minHeight: '200px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '2px solid #f8f9fa'
            }}>
              <h3 style={{ 
                margin: '0', 
                color: '#2c3e50', 
                fontSize: '20px',
                fontWeight: '700'
              }}>
                {list.name}
              </h3>
              <button 
                onClick={() => deleteList(listIndex)}
                style={{
                  padding: '6px 10px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(220, 53, 69, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#c82333';
                  e.target.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#dc3545';
                  e.target.style.transform = 'scale(1)';
                }}
                title="Delete this list"
              >
                ×
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="New item"
                  value={list.newItem}
                  onChange={(e) => updateNewItem(listIndex, e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addItem(listIndex)}
                  className="todo-input"
                  style={{
                    padding: '10px 14px',
                    border: '2px solid #e9ecef',
                    borderRadius: '10px',
                    flex: 1,
                    fontSize: '14px',
                    backgroundColor: 'white',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#28a745'}
                  onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                />
                <button 
                  onClick={() => addItem(listIndex)}
                  className="todo-button"
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(40, 167, 69, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#218838';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#28a745';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Add
                </button>
              </div>
              <ul style={{ 
                listStyle: 'none', 
                padding: '0', 
                margin: '8px 0 0 0',
                fontSize: '14px',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                {list.items.map((item, itemIndex) => (
                  <li 
                    key={itemIndex} 
                    className="todo-item"
                    style={{ 
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#e9ecef';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#f8f9fa';
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleItemCompletion(listIndex, itemIndex)}
                      className="todo-checkbox"
                      style={{
                        cursor: 'pointer',
                        width: '18px',
                        height: '18px',
                        accentColor: '#28a745'
                      }}
                    />
                    <span style={{
                      textDecoration: item.completed ? 'line-through' : 'none',
                      color: item.completed ? '#6c757d' : '#495057',
                      flex: 1,
                      fontSize: '14px',
                      fontWeight: item.completed ? '400' : '500'
                    }}>
                      {item.text}
                    </span>
                    <button 
                      onClick={() => deleteItem(listIndex, itemIndex)}
                      className="todo-delete-item"
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        minWidth: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        opacity: '0.8'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.opacity = '1';
                        e.target.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.opacity = '0.8';
                        e.target.style.transform = 'scale(1)';
                      }}
                      title="Delete this item"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
