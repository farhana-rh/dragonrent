import React from 'react';
import classNames from 'classnames';
import { useIntl } from '../../../../../util/reactIntl';
import { FieldTextInput } from '../../../../../components';

import css from './FilterKeyword.module.css';

const FilterKeyword = props => {
  const intl = useIntl();
  // DragonRent: the homepage hero passes rotating example searches as the placeholder
  const { className, rootClassName, placeholder } = props;
  const rootClass = rootClassName || css.root;
  const classes = classNames(rootClass, className);

  return (
    <div className={classes}>
      <FieldTextInput
        className={css.customField}
        inputRootClass={css.input}
        name={'keywords'}
        type="text"
        placeholder={
          placeholder ||
          intl.formatMessage({
            id: 'PageBuilder.SearchCTA.keywordFilterPlaceholder',
          })
        }
        aria-label={intl.formatMessage({
          id: 'PageBuilder.SearchCTA.keywordFilterPlaceholder',
        })}
      />
    </div>
  );
};

export default FilterKeyword;
