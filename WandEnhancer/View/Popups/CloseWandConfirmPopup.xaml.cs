using System;
using System.Windows.Controls;
using WandEnhancer.Core.Services;

namespace WandEnhancer.View.Popups
{
    /// <summary>
    /// Asks before force-closing a running Wand so Patch/Restore never does it silently.
    /// Dismissing without clicking confirm (the popup's own close button, or Escape) is
    /// the cancel path - the caller simply never gets its callback invoked.
    /// </summary>
    public partial class CloseWandConfirmPopup : UserControl
    {
        private readonly Action _onConfirm;

        public CloseWandConfirmPopup(string brandName, Action onConfirm)
        {
            _onConfirm = onConfirm;
            InitializeComponent();

            MessageText.Text = LocalizationManager.Format("cwc_message", brandName);
        }

        private void OnConfirmClick(object sender, System.Windows.RoutedEventArgs e)
        {
            _onConfirm();
        }
    }
}
