import Button from "react-ui-basics/Button";
import AutocompleteSelect from "react-ui-basics/AutocompleteSelect";
import {classNames, orNoop} from "react-ui-basics/Tools";
import {css} from "goober";
import {SCROLLBAR_MODE_HIDDEN} from "react-ui-basics/Scrollable";
import {pushLocation} from "react-ui-basics/router/HistoryTools";
import {FlexRow} from "./SharedComponents";
import MaterialIcon from "react-ui-basics/MaterialIcon";
import React from "react";

const MenuIcon = () => <Button flat={true} round={true}>
    <i className="material-icons">more_vert</i>
</Button>;

const DummyChild = ({id, label, dataConsumer, onClick}) => {
    orNoop(dataConsumer)(label || id);
    if (id === 'separator')
        return label
    return <div className={`DummyChild`} onClick={onClick}>{label || id}</div>
};

const MoreMenu = ({className}) => <AutocompleteSelect
    className={classNames(css`
      min-width: 0;

      .popup {
        right: 0;

        .DummyChild {
          font-size: 14px;
          color: #818181;
        }

        .material-icons {
          color: #818181;
          margin-right: 4px;
        }

        .ItemWrapper {
          height: unset;

          &.selected {
            padding-left: 15px;
            margin-left: -5px;
          }
        }
      }

      > .selected {
        border: none;

        &.nolabel {
          border: none;
        }

        .material-icons {
          color: #A6A6A6;
          transition: color 0.2s ease;
        }
      }

      &.active .selected .material-icons {
        color: #333333;
      }

    `, className)}
    scroll={SCROLLBAR_MODE_HIDDEN}
    value={true}
    withArrow={false}
    selectedComponent={MenuIcon}
    withFilter={false}
    selectedMode={'inline'}
    onSelect={v => {
        v === 'settings' && pushLocation('/settings')
        v === 'cache' && pushLocation('/cache')
    }}
    data={[
        // 'separator',
        'settings',
        'cache',
    ]}
    childComponent={DummyChild}
    labels={{
        'separator': <FlexRow className={css`
          height: 1px;
          width: 100%;
          background: gray;
        `}>
        </FlexRow>,
        'settings': <FlexRow>
            <MaterialIcon icon={'settings'}/>
            Settings
        </FlexRow>,
        'cache': <FlexRow>
            <MaterialIcon icon={'archive'}/>
            Cache
        </FlexRow>,
    }}
/>;

export default MoreMenu