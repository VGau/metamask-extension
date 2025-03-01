import React from 'react';
import configureMockStore from 'redux-mock-store';

import {
  getMockApproveConfirmState,
  getMockContractInteractionConfirmState,
  getMockPersonalSignConfirmState,
  getMockPersonalSignConfirmStateForRequest,
  getMockSetApprovalForAllConfirmState,
  getMockTypedSignConfirmState,
  getMockTypedSignConfirmStateForRequest,
} from '../../../../../../test/data/confirmations/helper';
import { unapprovedPersonalSignMsg } from '../../../../../../test/data/confirmations/personal_sign';
import { permitSignatureMsg } from '../../../../../../test/data/confirmations/typed_sign';
import { renderWithConfirmContextProvider } from '../../../../../../test/lib/confirmations/render-helpers';
import { tEn } from '../../../../../../test/lib/i18n-helpers';
import {
  Alert,
  ConfirmAlertsState,
} from '../../../../../ducks/confirm-alerts/confirm-alerts';
import { Severity } from '../../../../../helpers/constants/design-system';
import { useIsNFT } from '../info/approve/hooks/use-is-nft';
import ConfirmTitle from './title';

jest.mock('../info/approve/hooks/use-is-nft', () => ({
  useIsNFT: jest.fn(() => ({ isNFT: true })),
}));

describe('ConfirmTitle', () => {
  it('should render the title and description for a personal signature', () => {
    const mockStore = configureMockStore([])(getMockPersonalSignConfirmState);
    const { getByText } = renderWithConfirmContextProvider(
      <ConfirmTitle />,
      mockStore,
    );

    expect(getByText('Signature request')).toBeInTheDocument();
    expect(
      getByText('Review request details before you confirm.'),
    ).toBeInTheDocument();
  });

  it('should render the title and description for a permit signature', () => {
    const mockStore = configureMockStore([])(
      getMockTypedSignConfirmStateForRequest(permitSignatureMsg),
    );
    const { getByText } = renderWithConfirmContextProvider(
      <ConfirmTitle />,
      mockStore,
    );

    expect(getByText('Spending cap request')).toBeInTheDocument();
    expect(
      getByText('This site wants permission to spend your tokens.'),
    ).toBeInTheDocument();
  });

  it('should render the title and description for typed signature', () => {
    const mockStore = configureMockStore([])(getMockTypedSignConfirmState());
    const { getByText } = renderWithConfirmContextProvider(
      <ConfirmTitle />,
      mockStore,
    );

    expect(getByText('Signature request')).toBeInTheDocument();
    expect(
      getByText('Review request details before you confirm.'),
    ).toBeInTheDocument();
  });

  it('should render the title and description for a contract interaction transaction', () => {
    const mockStore = configureMockStore([])(
      getMockContractInteractionConfirmState(),
    );
    const { getByText } = renderWithConfirmContextProvider(
      <ConfirmTitle />,
      mockStore,
    );

    expect(
      getByText(tEn('confirmTitleTransaction') as string),
    ).toBeInTheDocument();
  });

  it('should render the title and description for a approval transaction for NFTs', () => {
    const mockStore = configureMockStore([])(getMockApproveConfirmState());
    const { getByText } = renderWithConfirmContextProvider(
      <ConfirmTitle />,
      mockStore,
    );

    expect(
      getByText(tEn('confirmTitleApproveTransaction') as string),
    ).toBeInTheDocument();
    expect(
      getByText(tEn('confirmTitleDescApproveTransaction') as string),
    ).toBeInTheDocument();
  });

  it('should render the title and description for a approval transaction for erc20 tokens', () => {
    const mockedUseIsNFT = jest.mocked(useIsNFT);

    mockedUseIsNFT.mockImplementation(() => ({
      isNFT: false,
      pending: false,
    }));

    const mockStore = configureMockStore([])(getMockApproveConfirmState());
    const { getByText } = renderWithConfirmContextProvider(
      <ConfirmTitle />,
      mockStore,
    );

    expect(
      getByText(tEn('confirmTitlePermitTokens') as string),
    ).toBeInTheDocument();
    expect(
      getByText(tEn('confirmTitleDescERC20ApproveTransaction') as string),
    ).toBeInTheDocument();
  });

  it('should render the title and description for a setApprovalForAll transaction', () => {
    const mockStore = configureMockStore([])(
      getMockSetApprovalForAllConfirmState(),
    );
    const { getByText } = renderWithConfirmContextProvider(
      <ConfirmTitle />,
      mockStore,
    );

    expect(
      getByText(tEn('setApprovalForAllRedesignedTitle') as string),
    ).toBeInTheDocument();
    expect(
      getByText(tEn('confirmTitleDescApproveTransaction') as string),
    ).toBeInTheDocument();
  });

  describe('Alert banner', () => {
    const alertMock = {
      severity: Severity.Danger,
      message: 'mock message',
      reason: 'mock reason',
      key: 'mock key',
    };
    const mockAlertState = (state: Partial<ConfirmAlertsState> = {}) =>
      getMockPersonalSignConfirmStateForRequest(unapprovedPersonalSignMsg, {
        metamask: {},
        confirmAlerts: {
          alerts: {
            [unapprovedPersonalSignMsg.id]: [alertMock, alertMock, alertMock],
          },
          confirmed: {
            [unapprovedPersonalSignMsg.id]: {
              [alertMock.key]: false,
            },
          },
          ...state,
        },
      });
    it('renders an alert banner if there is a danger alert', () => {
      const mockStore = configureMockStore([])(
        mockAlertState({
          alerts: {
            [unapprovedPersonalSignMsg.id]: [alertMock as Alert],
          },
        }),
      );
      const { queryByText } = renderWithConfirmContextProvider(
        <ConfirmTitle />,
        mockStore,
      );

      expect(queryByText(alertMock.reason)).toBeInTheDocument();
      expect(queryByText(alertMock.message)).toBeInTheDocument();
    });

    it('renders alert banner when there are multiple alerts', () => {
      const mockStore = configureMockStore([])(mockAlertState());

      const { getByText } = renderWithConfirmContextProvider(
        <ConfirmTitle />,
        mockStore,
      );

      expect(getByText('Multiple alerts!')).toBeInTheDocument();
    });
  });
});
