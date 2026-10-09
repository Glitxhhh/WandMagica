using System;
using System.IO;
using System.Threading;

namespace WandEnhancer.Utils
{
    /// <summary>
    /// Retries a file operation that can fail with a transient lock. Killing Wand's own
    /// process(es) does not guarantee every file it (or something it injected into) had open
    /// is released the instant the process exits - the OS can take a moment to tear down the
    /// handle table, and a DLL injected into a separate process (a game, say) is not touched by
    /// killing Wand at all. Observed in practice: ProcessTerminator confirms every "Wand"-named
    /// process is dead, yet the very next copy still throws access-denied on an unrelated file.
    /// </summary>
    internal static class FileRetry
    {
        private const int Attempts = 6;
        private const int DelayMs = 400;

        /// <summary>Runs <paramref name="action"/>, retrying on a locked-file exception.</summary>
        /// <exception cref="IOException">
        /// The last attempt's exception, if every attempt failed. Its message is replaced with
        /// one naming the file and suggesting a running game as the likely remaining holder.
        /// </exception>
        public static void Run(Action action)
        {
            for (int attempt = 1; attempt <= Attempts; attempt++)
            {
                try
                {
                    action();
                    return;
                }
                catch (Exception e) when ((e is IOException || e is UnauthorizedAccessException) && attempt < Attempts)
                {
                    Thread.Sleep(DelayMs);
                }
                catch (IOException e)
                {
                    throw new IOException(
                        $"{e.Message} Still locked after closing Wand. If a game it modified is still running, close that too and try again.",
                        e);
                }
                catch (UnauthorizedAccessException e)
                {
                    throw new IOException(
                        $"{e.Message} Still locked after closing Wand. If a game it modified is still running, close that too and try again.",
                        e);
                }
            }
        }
    }
}
