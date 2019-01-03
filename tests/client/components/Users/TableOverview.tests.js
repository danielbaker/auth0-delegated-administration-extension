import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { describe, it } from 'mocha';

import TableOverview from '../../../../client/components/Users/TableOverview';
import Table from '../../../../client/components/Users/Table';
import LuceneSearchBar from '../../../../client/components/Users/LuceneSearchBar';

describe('#Client-Components-TableOverview', () => {
  const renderComponent = (languageDictionary) => {
    return shallow(
      <TableOverview
        loading={false}
        error={null}
        onReset={() => 'onReset'}
        onSearch={() => 'onSearch'}
        onPageChange={() => 'onPageChange'}
        onColumnSort={() => 'onColumnSort'}
        users={[{ username: 'bill'}]}
        userFields={[]}
        sortOrder={1}
        sortProperty={'username'}
        settings={{}}
        languageDictionary={languageDictionary}
      />
    );
  };

  beforeEach(() => {
  });

  it('should pass language dictionary', () => {
    const languageDictionary = {
      logEventColumnHeader: 'EventHeader',
      logDescriptionColumnHeader: 'DescriptionHeader',
      logDateColumnHeader: 'DateHeader',
      logConnectionColumnHeader: 'ConnectionHeader',
      logApplicationColumnHeader: 'ApplicationHeader',
      momentLocale: 'fr',
      notApplicableLabel: 'Not Applicable'
    };

    const component = renderComponent(languageDictionary);
    expect(component.length).to.be.greaterThan(0);

    const searchBar = component.find(LuceneSearchBar);
    expect(searchBar.length).to.equal(1);
    expect(searchBar.prop('languageDictionary')).to.deep.equal(languageDictionary);

    const usersTable = component.find(Table);
    expect(usersTable.length).to.equal(1);
    expect(usersTable.prop('languageDictionary')).to.deep.equal(languageDictionary);
  });
});
