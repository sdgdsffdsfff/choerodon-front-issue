import React, { Component, Fragment } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Card, Tooltip, Button, Input,
} from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import Tips from '../Tips';
import './DragList.scss';

class DragList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addItemVisible: false,
      tempKey: false,
      value: '',
      saveDisabled: true,
    };
  }

  /**
   * 拖动完成时触发
   * @param result
   */
  onDragEnd = (result) => {
    const { data, onChange } = this.props;
    const { source, destination } = result;

    // 拖拽到边框外
    if (!destination) {
      return;
    }

    // 排序
    const items = this.reorder(
      data,
      source.index,
      destination.index,
    );
    onChange(items);
  };

  // 开始拖动回调
  onDragStart = () => {
    this.setState({
      addItemVisible: false,
      tempKey: false,
    });
  };

  // 获取元素样式，根据是否拖动变化
  getItemStyle = (isDragging, draggableStyle, item) => {
    let color = '#DDE7F2';
    if (isDragging) {
      color = '#DDE7F2';
    } else if (item.isEnable === '1') {
      color = '#F7F7F7';
    } else {
      color = '#F0F0F0';
    }
    return {
      userSelect: 'none',
      padding: '5px 20px',
      margin: '0 0 5px 0',
      background: color,
      height: 34,
      ...draggableStyle,
    };
  };

  /**
   * 排序
   * @param list
   * @param startIndex
   * @param endIndex
   * @returns {Array}
   */
  reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  addItem = () => {
    this.setState({
      addItemVisible: true,
    }, () => {
      const input = document.getElementById('dragList-input');
      if (input) {
        input.focus();
      }
    });
  };

  editItem = (tempKey) => {
    this.setState({
      tempKey,
    }, () => {
      const input = document.getElementById('dragList-input');
      if (input) {
        input.focus();
      }
    });
  };

  edit = (tempKey) => {
    const { data, onEdit, onChange } = this.props;
    const { value } = this.state;
    if (onEdit) {
      onEdit(tempKey, value);
    }
    if (onChange) {
      const updatedData = data.map((d) => {
        if (d.tempKey === tempKey || d.id === tempKey) {
          return { ...d, value };
        } else {
          return d;
        }
      });
      onChange(updatedData, 'edit');
    }
    this.cancel();
  };

  invalid = (tempKey) => {
    const { data, onInvalid, onChange } = this.props;
    if (onInvalid) {
      onInvalid(tempKey);
    }
    if (onChange) {
      const updatedData = data.map((d) => {
        if (d.tempKey === tempKey || d.id === tempKey) {
          return { ...d, isEnable: '0' };
        } else {
          return d;
        }
      });
      onChange(updatedData, 'invalid');
    }
    this.cancel();
  };

  active = (tempKey) => {
    const { data, onActive, onChange } = this.props;
    if (onActive) {
      onActive(tempKey);
    }
    if (onChange) {
      const updatedData = data.map((d) => {
        if (d.tempKey === tempKey || d.id === tempKey) {
          return { ...d, isEnable: '1' };
        } else {
          return d;
        }
      });
      onChange(updatedData, 'active');
    }
    this.cancel();
  };

  create = () => {
    const { onCreate } = this.props;
    const { value } = this.state;
    if (onCreate) {
      onCreate(value);
    }
    this.cancel();
  };

  remove = (tempKey) => {
    const { data, onDelete, onChange } = this.props;
    if (onDelete) {
      onDelete(tempKey);
    }
    if (onChange) {
      const updatedData = data.filter(d => d.tempKey !== tempKey && d.id !== tempKey);
      onChange(updatedData, 'delete');
    }
    this.cancel();
  };

  cancel = () => {
    this.setState({
      addItemVisible: false,
      saveDisabled: true,
      tempKey: false,
      value: '',
    });
  };

  onInputChange = (e) => {
    if (e.target.value) {
      this.setState({
        saveDisabled: false,
        value: e.target.value,
      });
    } else {
      this.setState({
        saveDisabled: true,
        value: '',
      });
    }
  };

  render() {
    const {
      data, title, tips, intl,
    } = this.props;
    const { addItemVisible, tempKey, saveDisabled } = this.state;

    return (
      <div>
        <div className="issue-dragList-des">
          <Tips tips={[tips]} />
        </div>
        <DragDropContext onDragEnd={this.onDragEnd} onDragStart={this.onDragStart}>
          <div className="issue-dragList-content">
            <Card
              title={title}
              extra={(
                <Button
                  onClick={this.addItem}
                  funcType="flat"
                  className="issue-dragList-addBtn"
                >
                  <i className="icon-add icon" />
                  <FormattedMessage id="add" />
                </Button>
              )}
              bordered={false}
              className="issue-dragList-card"
            >
              <Droppable droppableId="droppable">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    className="issue-issueTypeDrag-drop"
                  >
                    {data && data.map((item, index) => (
                      <Draggable
                        key={item.tempKey || item.id}
                        draggableId={item.tempKey || item.id}
                        index={index}
                      >
                        {(subProvided, subSnapshot) => (
                          <div
                            ref={subProvided.innerRef}
                            {...subProvided.draggableProps}
                            {...subProvided.dragHandleProps}
                            style={this.getItemStyle(
                              subSnapshot.isDragging,
                              subProvided.draggableProps.style,
                              item,
                            )}
                          >
                            {item.id === tempKey || item.tempKey === tempKey
                              ? (
                                <Fragment>
                                  <span className="issue-dragList-input">
                                    <Input
                                      id="dragList-input"
                                      defaultValue={item.value}
                                      onChange={this.onInputChange}
                                      underline={false}
                                      placeholder={intl.formatMessage({ id: 'dragList.placeholder' })}
                                    />
                                  </span>
                                  <Button
                                    disabled={saveDisabled}
                                    type="primary"
                                    size="small"
                                    onClick={() => this.edit(tempKey)}
                                    funcType="raised"
                                    className="issue-dragList-add"
                                  >
                                    <FormattedMessage id="save" />
                                  </Button>
                                  <Button
                                    size="small"
                                    onClick={this.cancel}
                                    funcType="raised"
                                  >
                                    <FormattedMessage id="cancel" />
                                  </Button>
                                </Fragment>
                              )
                              : (
                                <Fragment>
                                  <span className="issue-dragList-text">{item.value}</span>
                                  <div className="issue-dragList-operate">
                                    <Tooltip
                                      placement="bottom"
                                      title={<FormattedMessage id="edit" />}
                                    >
                                      <Button
                                        size="small"
                                        shape="circle"
                                        onClick={() => this.editItem(item.tempKey || item.id)}
                                      >
                                        <i className="icon icon-mode_edit" />
                                      </Button>
                                    </Tooltip>
                                    {
                                      item.isEnable === '1'
                                        ? (
                                          <Tooltip
                                            placement="bottom"
                                            title={<FormattedMessage id="dragList.invalid" />}
                                          >
                                            <Button size="small" shape="circle" onClick={() => this.invalid(item.tempKey || item.id)}>
                                              <i className="icon icon-block" />
                                            </Button>
                                          </Tooltip>
                                        )
                                        : (
                                          <Tooltip
                                            placement="bottom"
                                            title={<FormattedMessage id="dragList.active" />}
                                          >
                                            <Button size="small" shape="circle" onClick={() => this.active(item.tempKey || item.id)}>
                                              <i className="icon icon-playlist_add_check" />
                                            </Button>
                                          </Tooltip>
                                        )
                                    }
                                    <Tooltip
                                      placement="bottom"
                                      title={<FormattedMessage id="delete" />}
                                    >
                                      <Button size="small" shape="circle" onClick={() => this.remove(item.tempKey || item.id)}>
                                        <i className="icon icon-delete" />
                                      </Button>
                                    </Tooltip>
                                  </div>
                                </Fragment>
                              )
                            }
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {addItemVisible
                      ? (
                        <div className="issue-dragList-addItem">
                          <span className="issue-dragList-input">
                            <Input
                              id="dragList-input"
                              onChange={this.onInputChange}
                              underline={false}
                              placeholder={intl.formatMessage({ id: 'dragList.placeholder' })}
                            />
                          </span>
                          <Button
                            type="primary"
                            size="small"
                            onClick={this.create}
                            funcType="raised"
                            className="issue-dragList-add"
                            disabled={saveDisabled}
                          >
                            <FormattedMessage id="save" />
                          </Button>
                          <Button
                            size="small"
                            onClick={this.cancel}
                            funcType="raised"
                          >
                            <FormattedMessage id="cancel" />
                          </Button>
                        </div>
                      )
                      : ''
                    }
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Card>
          </div>
        </DragDropContext>
      </div>
    );
  }
}

export default injectIntl(DragList);
